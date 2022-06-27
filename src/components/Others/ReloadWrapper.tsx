import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";

// For snackbars
import { useSnackbar } from 'notistack';

// Icons
const CircularProgress = lazy(() => import("@mui/material/CircularProgress"));
const Fab = lazy(() => import("@mui/material/Fab"));
const AutorenewIcon = lazy(() => import("@mui/icons-material/Autorenew"));

// Custom
// @ts-ignore
const CenteredGrid = lazy(() => import("./CenteredGrid.tsx"));

// The reload wrapper component
function ReloadWrapper(props) {

    const {loading, error, component, reloadFct} = props as {
        loading: boolean;
        error: Error | undefined;
        reloadFct: () => any;
        component: JSX.Element;
        [key: string]: any;
    };
    const { t } = useTranslation('common');
    const { enqueueSnackbar } = useSnackbar();

    const RealComponent = () => {
        return component;
    }

    if (error){
        enqueueSnackbar(
            error.message,
            {
                variant: 'error',
                TransitionProps: {
                    unmountOnExit: true,
                    in: false
                }
            }
        )
    }

    return <Suspense fallback={null}>
        {loading && <CenteredGrid><CircularProgress/></CenteredGrid>}
        {error && <>
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
        </>}
        { ( (loading === false) && !error) && <RealComponent /> }
    </Suspense>
}

export default ReloadWrapper;
