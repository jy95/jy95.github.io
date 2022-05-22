import React from "react";
import { styled } from '@mui/material/styles';
import {connect} from 'react-redux';
import {get_latest_videos} from "../../actions/latestVideos.tsx";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper.tsx";

// Style
import Grid from "@mui/material/Grid";
import CardEntry from "../GamesView/CardEntry.tsx";

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

    const {loading, error, data} = props;

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_latest_videos();
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ReloadWrapper 
            loading={loading}
            error={error}
            reloadFct={() => {props.get_latest_videos();}}
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
                                            key={game.playlistId ?? game.videoId} 
                                            item 
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

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.latestVideos.items
});

const mapDispatchToProps = {
    get_latest_videos
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LatestVideosGallery);