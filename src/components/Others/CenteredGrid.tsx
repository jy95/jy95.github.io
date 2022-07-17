import Grid from "@mui/material/Grid";

function CenteredBox(props : {[key: string | number | symbol] : any}) {
    const {children} = props;
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{minHeight: '80vh'}}
        >
            {children}
        </Grid>
    );
}

export default CenteredBox;