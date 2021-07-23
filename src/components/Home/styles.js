import {makeStyles} from '@material-ui/styles';

// A style sheet
export default makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3)
    },
}));