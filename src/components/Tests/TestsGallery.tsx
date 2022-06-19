import { useEffect } from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';

// Style
import Grid from "@mui/material/Grid";

// Custom
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// @ts-ignore
import CardEntry from "../GamesView/CardEntry.tsx";

import { RootState, AppDispatch } from '../Store';
import { fetchTests } from "../../services/testsSlice";

const PREFIX = 'TestsGallery';

const classes = {
    gameEntry: `${PREFIX}-gameEntry`,
    gamesCriteria: `${PREFIX}-gamesCriteria`
};

const StyledTestsGallery = styled('div')((
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
function TestsGallery(_props) {

    const dispatch: AppDispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.tests.loading);
    const error = useSelector((state: RootState) => state.tests.error);
    const data = useSelector((state: RootState) => state.tests.games);

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchTests());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchTests());}}
            component={
                <StyledTestsGallery>    
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
                                            key={game.playlistId ?? game.videoId} 
                                            item 
                                            className={classes.gameEntry}
                                        >
                                            <CardEntry game={game}/>
                                        </Grid>
                                )
                        }
                    </Grid>
                </StyledTestsGallery>            
            }
        />
    );
}

export default TestsGallery;