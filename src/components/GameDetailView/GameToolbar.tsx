import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";

import CloseIcon from '@mui/icons-material/Close';
import Typography from "@mui/material/Typography";

function GameToolbar({ gameTitle, onClose }: { gameTitle: string, onClose: () => void }) {
    return (
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {gameTitle}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default GameToolbar;