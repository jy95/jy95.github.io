import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { amber, green } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import WarningIcon from '@mui/icons-material/Warning';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';


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
                <IconButton
                    key="close"
                    aria-label="close"
                    color="inherit"
                    onClick={onClose}
                    size="large">
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