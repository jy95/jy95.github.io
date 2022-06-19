import { useState, Suspense, lazy } from 'react';
import { styled } from '@mui/material/styles';
import { cx } from '@emotion/css';
import CloseIcon from '@mui/icons-material/Close';
import { amber, green } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';

const CheckCircleIcon = lazy(() => import("@mui/icons-material/CheckCircle"));
const WarningIcon = lazy(() => import("@mui/icons-material/Warning"));
const ErrorIcon = lazy(() => import("@mui/icons-material/Error"));
const InfoIcon = lazy(() => import("@mui/icons-material/Info"));

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

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

function CustomSnackbar(props) {

    const { className, message, onClose, variant, ...other } = props as {
        variant: 'error' | 'info' | 'success' | 'warning';
        className: string;
        message: string;
        onClose: () => void;
        [key: string]: any;
    };
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={cx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Suspense fallback={null}>
                        <Icon className={cx(classes.icon, classes.iconVariant)} />
                    </Suspense>
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

function CustomizedSnackbar(props) {
    const [open, setOpen] = useState(true);
    const {variant, message} = props as {
        variant: 'error' | 'info' | 'success' | 'warning';
        message: string;
        [key: string]: any;
    };

    const handleClose = (_event, reason : string) => {
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

export default CustomizedSnackbar;