"use client";

// Components
import CardEntry from "@/components/GamesView/CardEntry";
import Grid from "@mui/material/Grid";

// Redux
import { fetchTests, selectTests } from "@/redux/services/testsSlice";

// Hooks
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";


export default function TestsPage() {

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => selectTests(state));

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchTests());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
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
    )
}