import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";

// Icons
const CircularProgress = lazy(() => import("@mui/material/CircularProgress"));
const Fab = lazy(() => import("@mui/material/Fab"));
const AutorenewIcon = lazy(() => import("@mui/icons-material/Autorenew"));

// Custom
const CenteredGrid = lazy(() => import("./CenteredGrid"));

// The reload wrapper component
function ReloadWrapper(props : {
    loading: boolean;
    error: Error | null | undefined;
    reloadFct: () => any;
    component: JSX.Element;
    [key: string | number | symbol] : any
}) {

    const {loading, error, component, reloadFct} = props;
    const { t } = useTranslation('common');

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
        { ( !loading && !error) && <>{component}</> }
    </Suspense>
}

export default ReloadWrapper;
