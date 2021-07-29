import React from "react";
import { styled } from '@material-ui/core/styles';
import {connect} from 'react-redux';
import {get_latest_videos} from "../../actions/latestVideos";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";

// Style
import Grid from "@material-ui/core/Grid";
import CardEntry from "../GamesView/CardEntry";

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
            "flex-basis": "calc((100% / 1) - 1%)"
        },
        [theme.breakpoints.only('sm')]: {
            "flex-basis": "calc((100% / 2) - 1%)"
        },
        [theme.breakpoints.only('md')]: {
            "flex-basis": "calc((100% / 4) - 1%)"
        },
        [theme.breakpoints.up('lg')]: {
            "flex-basis": "calc((100% / 5) - 1%)"
        },
    },
    [`& .${classes.gamesCriteria}`]: {
        display: "flex",
        [theme.breakpoints.down('sm')]: {
            "flex-direction": "column",
            "row-gap": "8px"
        },
        [theme.breakpoints.up('md')]: {
            "flex-direction": "row",
            "justify-content": "flex-end"
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