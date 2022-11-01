import { useEffect } from "react";
import Grid from "@mui/material/Grid";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";
import CardEntry from "../GamesView/CardEntry";

// Redux
import { fetchLatestVideos, selectLatestVideos } from "../../services/latestVideosSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

// The gallery component
function LatestVideosGallery(_props : {[key: string | number | symbol] : any}) {

    const dispatch = useAppDispatch();
    const {
        loading,
        error,
        items : data
    } = useAppSelector( (state) => selectLatestVideos(state));

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