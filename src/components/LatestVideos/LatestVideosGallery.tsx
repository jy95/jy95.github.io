import { useEffect } from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Grid from "@mui/material/Grid";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";
import CardEntry from "../GamesView/CardEntry";

// Redux
import { fetchLatestVideos } from "../../services/latestVideosSlice";
import type { RootState, AppDispatch } from '../Store';

const PREFIX = 'LatestVideosGallery';

const classes = {
    gamesCriteria: `${PREFIX}-gamesCriteria`
};

const StyledLatestVideosGallery = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.gamesCriteria}`]: {
        display: "flex",
        [theme.breakpoints.down('md')]: {
            flexDirection: "column",
            rowGap: "8px"
        },
        [theme.breakpoints.up('md')]: {
            flexDirection: "row",
            justifyContent: "flex-end"
        }
    }
}));

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
                <StyledLatestVideosGallery>    
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
                </StyledLatestVideosGallery>            
            }
        />
    );
}

export default LatestVideosGallery;