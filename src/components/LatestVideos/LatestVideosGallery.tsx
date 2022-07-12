import { useEffect } from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Grid from "@mui/material/Unstable_Grid2";

// Custom
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";

// @ts-ignore
import CardEntry from "../GamesView/CardEntry.tsx";

// Redux
// @ts-ignore
import { fetchLatestVideos } from "../../services/latestVideosSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

const PREFIX = 'LatestVideosGallery';

const classes = {
    gameEntry: `${PREFIX}-gameEntry`,
    gamesCriteria: `${PREFIX}-gamesCriteria`
};

const StyledLatestVideosGallery = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.gameEntry}`]: {
        [theme.breakpoints.only('xs')]: {
            flexBasis: "calc((100% / 1) - 1%)"
        },
        [theme.breakpoints.only('sm')]: {
            flexBasis: "calc((100% / 2) - 1%)"
        },
        [theme.breakpoints.only('md')]: {
            flexBasis: "calc((100% / 4) - 1%)"
        },
        [theme.breakpoints.up('lg')]: {
            flexBasis: "calc((100% / 5) - 1%)"
        },
    },
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
function LatestVideosGallery(props) {

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
                                            className={classes.gameEntry}
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