import React from 'react';
import {useTranslation} from "react-i18next";
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    List
} from '@material-ui/core';

import {
    Link
} from "react-router-dom"

import Tooltip from '@material-ui/core/Tooltip';

// icons
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import ScheduleIcon from '@material-ui/icons/Schedule';

function ListItemLink(props) {
    const { icon, primary, to } = props;
    const { t } = useTranslation('common');
    const entry_label = t(primary);

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
        <Tooltip title={entry_label} aria-label={primary}>
            <ListItem button component={renderLink}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={entry_label} />
            </ListItem>
        </Tooltip>
    )

}

export const ENTRIES = (
    <List>
        <ListItemLink
            icon={<SportsEsportsIcon />}
            primary={"main.menuEntries.gamesKey"}
            to={"/games"}
        />
        <ListItemLink
            icon={<ScheduleIcon />}
            primary={"main.menuEntries.planningKey"}
            to={"/planning"}
        />
    </List>
);