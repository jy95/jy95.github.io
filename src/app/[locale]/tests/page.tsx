"use client";

// hooks
import { useGetTestsQuery } from "@/redux/services/testsAPI";

// Components
import CardEntry from "@/components/GamesView/CardEntry";
import Grid from '@mui/material/Grid2';

export default function TestsPage() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetTestsQuery({});

    if (error) {
        return <>Something bad happened</>;
    }
    
    if (isLoading) {
        return <>Loading</>;
    }

    if (!data) {
        return null;
    }

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
                        .items
                        .map(game => 
                                <Grid 
                                    key={game.id}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                        // 5 items for this screen size
                                        lg: 2.4
                                    }}
                                >
                                    <CardEntry game={game}/>
                                </Grid>
                        )
                }
            </Grid>
        </div>
    )
}