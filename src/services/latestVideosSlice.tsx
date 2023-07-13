import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { RootState } from "../components/Store"

// rss url
// Because of Youtube, I have to pass by a proxy
const RSS_YOUTUBE_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCG0N7IV-C43AM9psxslejCQ";
const FEED_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_YOUTUBE_FEED_URL)}`;

interface rssItem {
    /** @description  Video ID on Youtube */
    videoId: string;
    /** @description  Title on Youtube */
    title: string;
    /** @description  Type of Link */
    url_type: "VIDEO";
    /** @description  Thumbnail on Youtube */
    imagePath: string;
    /** @description  Youtube link */
    url: string;
    /** @description  React ID : identical to videoId */
    id: string
    // TODO : Duration as int
    // TODO : Release date
    // TODO : genre
}

interface latestVideosState {
    /** @description error occurred ? */
    error: null | Error,
    /** @description data loading ? */
    loading: boolean,
    /** @description Latest videos */
    items: rssItem[],
    /** @description When latest fetch happens */
    latestFetchedDate: number | undefined;
}

const initialState : latestVideosState = {
    items: [],
    latestFetchedDate: undefined,
    loading: false,
    error: null
}

function decodeHtml(html : string | any) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function mapRSSItemsToGame(items : {
    title: string,
    link: string,
    [key: string]: any;
}[]) : rssItem[] {
    return items
        .map(item => {
            const videoId = item.id.substring("yt:video:".length);
            return {
                videoId,
                id: videoId,
                title: decodeHtml(item.title),
                url: item.link,
                url_type: "VIDEO",
                imagePath: "https://i.ytimg.com/vi_webp/" + videoId + "/0.webp"
            }
        });
}

// Youtube updates by default rss feed each 15 minutes
const YOUTUBE_REFRESH_TIME_IN_MINUTES = 15;

// to compute delay in minutes between two dates (d1 : previous / d2 : current)
const diff_minutes = (d1: Date, d2: Date) => Math.abs(
    Math.round(
        (d2.getTime() - d1.getTime()) / 1000
    )
);

const shouldRequest = (data : any[], latestFetchingDate : number | undefined, dateNow : Date) => [
    () => data.length === 0,
    () => (latestFetchingDate && diff_minutes(new Date(latestFetchingDate), dateNow) >= YOUTUBE_REFRESH_TIME_IN_MINUTES)
].some(pred => pred() === true);

export const fetchLatestVideos = createAsyncThunk('Youtube/fetchLatestVideo', async () => {
    // rss parser
    const { parse } = await import(/* webpackExports: "parse" */ 'rss-to-json');

    const { items } = await parse(FEED_URL, {
        transformResponse: function (data) {
            // needed for https://allorigins.win/ 
            return JSON.parse(data)?.contents || "";
        }
    });

    return {
        items: mapRSSItemsToGame(items)
    }
}, {
    condition: (_params, { getState } ) => {
        const {
            latestVideos
        } = getState() as {
            [key: string]: any,
            latestVideos: latestVideosState
        };

        // don't need to re-fetch if not
        return shouldRequest(
            latestVideos.items,
            latestVideos.latestFetchedDate,
            new Date()
        );
    }
});

const latestVideosSlice = createSlice({
    name: 'latestVideos',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchLatestVideos.pending, (state : latestVideosState, _) => {
                state.loading = true;
            })       
            .addCase(fetchLatestVideos.fulfilled, (state : latestVideosState, { payload }) => {
                state.loading = false;
                state.items = (payload as any).items as rssItem[];
                state.error = null;
                state.latestFetchedDate = new Date().getTime();
            })
            .addCase(fetchLatestVideos.rejected, (state : latestVideosState, { payload }) => {
                state.loading = false;
                state.items = [];
                state.error = payload as Error;
                state.latestFetchedDate = undefined;
            });
    }
});

export const selectLatestVideos = createSelector(
    (state : RootState) => state.latestVideos,
    (latestVideos) => latestVideos
);

// Action creators are generated for each case reducer function
// export const {} = latestVideosSlice.actions;
export default latestVideosSlice.reducer;