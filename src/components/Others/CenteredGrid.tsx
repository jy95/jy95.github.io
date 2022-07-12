import Grid from "@mui/material/Unstable_Grid2";

function CenteredBox(props) {
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