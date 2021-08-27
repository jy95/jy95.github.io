import React from 'react';
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Warning';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';


const PREFIX = 'CustomizedSnackbar';

const classes = {
    success: `${PREFIX}-success`,
    error: `${PREFIX}-error`,
    info: `${PREFIX}-info`,
    warning: `${PREFIX}-warning`,
    icon: `${PREFIX}-icon`,
    iconVariant: `${PREFIX}-iconVariant`,
    message: `${PREFIX}-message`
};

const StyledSnackbar = styled(Snackbar)((
    {
        theme
    }
) => ({
    [`& .${classes.success}`]: {
        backgroundColor: green[600],
    },
    [`& .${classes.error}`]: {
        backgroundColor: theme.palette.error.dark,
    },
    [`& .${classes.info}`]: {
        backgroundColor: theme.palette.primary.main,
    },
    [`& .${classes.warning}`]: {
        backgroundColor: amber[700],
    },
    [`& .${classes.icon}`]: {
        fontSize: 20,
    },
    [`& .${classes.iconVariant}`]: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    [`& .${classes.message}`]: {
        display: 'flex',
        alignItems: 'center',
    },
    [`& .${classes.success}`]: {
        backgroundColor: green[600],
    },
    [`& .${classes.error}`]: {
        backgroundColor: theme.palette.error.dark,
    },
    [`& .${classes.info}`]: {
        backgroundColor: theme.palette.primary.main,
    },
    [`& .${classes.warning}`]: {
        backgroundColor: amber[700],
    },
    [`& .${classes.icon}`]: {
        fontSize: 20,
    },
    [`& .${classes.iconVariant}`]: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    [`& .${classes.message}`]: {
        display: 'flex',
        alignItems: 'center',
    }
}));


const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

function CustomSnackbar(props) {

    const { className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={clsx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
                    {message}
        </span>
            }
            action={[
                <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
}

CustomSnackbar.propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
    onClose: PropTypes.func,
    variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
};

function CustomizedSnackbar(props) {
    const [open, setOpen] = React.useState(true);
    const {variant, message} = props;

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <StyledSnackbar
            open={open}
            autoHideDuration={5000}
            onClose={handleClose}
        >
            <CustomSnackbar
                onClose={handleClose}
                variant={variant}
                message={message}
            />
        </StyledSnackbar>
    );
}

CustomizedSnackbar.propTypes = {
    variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
    message: PropTypes.string.isRequired,
};

export default CustomizedSnackbar;