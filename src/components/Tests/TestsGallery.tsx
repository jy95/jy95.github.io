import React from "react";
import { styled } from '@mui/material/styles';
import {connect} from 'react-redux';
import {get_tests} from "../../actions/tests.tsx";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
import CardEntry from "../GamesView/CardEntry.tsx";

// Style
import Grid from "@mui/material/Grid";

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
function TestsGallery(props) {

    const {loading, error, data} = props;

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_tests();
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {props.get_tests();}}
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

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.tests.games
});

const mapDispatchToProps = {
    get_tests
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TestsGallery);