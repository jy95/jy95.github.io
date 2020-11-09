import React from 'react';
import {connect} from 'react-redux';
import { withTranslation } from 'react-i18next';
import {get_scheduled_games} from "../../actions/planning";

import CircularProgress from '@material-ui/core/CircularProgress';

import CenteredGrid from "../Others/CenteredGrid";

// Timeline
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';

// Style
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Tooltip from '@material-ui/core/Tooltip';

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_scheduled_games();
    };

    render() {

        const {loading, data, t} = this.props;
        const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

        if (loading) {
            return <CenteredGrid>
                <CircularProgress/>
            </CenteredGrid>
        }

        return (
            //<CardsBox data={this.props.data}/>
            <Timeline align="alternate">
                {
                    data.map(scheduledGame => 
                        <TimelineItem>
                            <TimelineOppositeContent>
                                <Typography variant="body2" color="textSecondary">
                                    {
                                        scheduledGame["releaseDate"]
                                            .toLocaleDateString(undefined, date_options)
                                    }
                                </Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot>
                                    <Tooltip title={t("planning.states." + scheduledGame.status )} aria-label={scheduledGame.status}>
                                        {
                                            (() => {
                                                switch(scheduledGame.status) {
                                                    case "RECORDED":
                                                        return <CheckCircleIcon />;
                                                    case "PENDING":
                                                        return <HourglassEmptyIcon />;
                                                    default:
                                                        return null;
                                                }
                                            })()
                                        }
                                    </Tooltip>
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <Paper elevation={3} >
                                    <Typography variant="h6" component="h1">
                                        {scheduledGame["title"]}
                                    </Typography>
                                </Paper>
                            </TimelineContent>  
                        </TimelineItem>
                    )
                }
            </Timeline>
        )

    }

}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.planning.planning,
    loading: state.planning.loading,
    error: state.planning.error,
});

const mapDispatchToProps = {
    get_scheduled_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withTranslation("common")(Viewer)
);
