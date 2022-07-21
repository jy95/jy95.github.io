import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Grid from "@mui/material/Grid";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";
import CardEntry from "../GamesView/CardEntry";

// Redux
import { fetchLatestVideos } from "../../services/latestVideosSlice";
import type { RootState, AppDispatch } from '../Store';

// The gallery component
function LatestVideosGallery(_props : {[key: string | number | symbol] : any}) {

    const dispatch: AppDispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.latestVideos.loading);
    const error = useSelector((state: RootState) => state.latestVideos.error);
    const data = useSelector((state: RootState) => state.latestVideos.items);

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchLatestVideos());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ReloadWrapper 
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchLatestVideos());}}
            component={
                <div>    
                    <Grid
                        container
                        spacing={1}
                        style={
                            {
                                rowGap: "15px"
                            }
                        }
                    >
                        {
                            data
                                .map(game => 
                                        <Grid 
                                            key={game.videoId} 
                                            item 
                                            xs={12}
                                            sm={6}
                                            md={3}
                                            // 5 items for this screen size
                                            lg={2.4}
                                        >
                                            <CardEntry game={game}/>
                                        </Grid>
                                )
                        }
                    </Grid>
                </div>
            }
        />
    );
}

export default LatestVideosGallery;