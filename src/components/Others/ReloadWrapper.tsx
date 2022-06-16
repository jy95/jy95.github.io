import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// Icons
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import AutorenewIcon from '@mui/icons-material/Autorenew';

// Custom
// @ts-ignore
import CenteredGrid from "./CenteredGrid.tsx";
// @ts-ignore
import SnackbarWrapper from "./CustomSnackbar.tsx";

// The reload wrapper component
function ReloadWrapper(props) {

    const {loading, error, component, reloadFct} = props;
    const { t } = useTranslation('common');

    if (loading) {
        return <CenteredGrid>
            <CircularProgress/>
        </CenteredGrid>
    }

    if (error) {
        return <>
            <SnackbarWrapper
                variant={"error"}
                message={error}
            />
            <CenteredGrid>
                <Fab
                    variant="extended"
                    size="medium"
                    color="primary"
                    aria-label="reload"
                    onClick={reloadFct}
                >
                    <AutorenewIcon/>
                    { t("common.reload") }
                </Fab>
            </CenteredGrid>
        </>;
    }
    
    return component;
}

// mapStateToProps(state, ownProps)
const mapStateToProps = _state => ({});
const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReloadWrapper);
