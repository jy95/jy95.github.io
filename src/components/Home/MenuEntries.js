import React from 'react';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    List
} from '@material-ui/core';

import {
    Link
} from "react-router-dom"

// icons
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import ScheduleIcon from '@material-ui/icons/Schedule';

function ListItemLink(props) {
    const { icon, primary, to } = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef((linkProps, ref) => (
                // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
                // See https://github.com/ReactTraining/react-router/issues/6056
                <Link to={to} {...linkProps} innerRef={ref} />
            )),
        [to],
    );

    return (
        <ListItem button component={renderLink}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={primary} />
        </ListItem>
    )

}

export const ENTRIES = (
    <List>
        <ListItemLink
            icon={<SportsEsportsIcon />}
            primary={"Jeux"}
            to={"/games"}
        />
        <ListItemLink
            icon={<ScheduleIcon />}
            primary={"Plannifié"}
            to={"/planning"}
        />
    </List>
);