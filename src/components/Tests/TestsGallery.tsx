import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

// Style
import Grid from "@mui/material/Grid";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";
import CardEntry from "../GamesView/CardEntry";
import { fetchTests } from "../../services/testsSlice";
import type { RootState, AppDispatch } from '../Store';

// The gallery component
function TestsGallery(_props : {[key: string | number | symbol] : any}) {

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
                                            key={game.id}
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

export default TestsGallery;