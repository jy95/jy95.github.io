import React from "react";
import {connect} from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {get_latest_videos} from "../../actions/latestVideos";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";

// Style
import Grid from "@material-ui/core/Grid";
import CardEntry from "../GamesView/CardEntry";

// To dynamically change the number of items depending of browser
// Here twice smaller than /games (as these games often are digital only)
const useStyles = makeStyles((theme) => ({
    gameEntry: {
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
    gamesCriteria: {
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
    const classes = useStyles(props);

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_latest_videos();
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return <ReloadWrapper 
        loading={loading}
        error={error}
        reloadFct={() => {props.get_latest_videos();}}
        component={
            <>    
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
            </>            
        }
    />
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