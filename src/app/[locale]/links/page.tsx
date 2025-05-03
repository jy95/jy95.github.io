// Components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

// Icons
import YouTubeIcon from "@mui/icons-material/YouTube";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';

// Types
import type { JSX } from 'react'

// Links
const LINKS : {
    icon: JSX.Element,
    // url to the website
    path: string,
    // Name of the website (universal name)
    primary: string
}[] = [
    {
        primary: "Youtube",
        path: "https://www.youtube.com/@GPFR1",
        icon: <YouTubeIcon />,
    },
    {
        primary: "Discord",
        path: "https://discord.gg/C2BTSAC",
        icon: <GroupsIcon />
    },
    {
        primary: "Odysee",
        path: "https://odysee.com/@GamesPassionFR:d",
        icon: <RocketLaunchIcon />
    },
    {
        primary: "Twitter / X",
        path: "https://x.com/GamesPassion_FR",
        icon: <TwitterIcon />
    },
    {
        primary: "Github",
        path: "https://github.com/jy95/jy95.github.io",
        icon: <GitHubIcon />
    }
]

// Channel props
const CHANNEL_NAME = "GamesPassionFR";
const CHANNEL_ICON_URL = "https://yt3.googleusercontent.com/GucDvaNg4zIpDmSQPj2BkvgrMdHQxrelheCbwmK00G0k1IfHJuWJt5OVa6656uZ9G-G1BFmN=s160-c-k-c0x00ffffff-no-rj";

export default function LinksViewer() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                padding: "2rem",
            }}
        >
            <Avatar src={CHANNEL_ICON_URL} sx={{ width: 80, height: 80 }} />
            <Typography variant="h5" gutterBottom>
                {CHANNEL_NAME}
            </Typography>

            {LINKS.map((link) => (
                <Button
                    key={link.primary}
                    variant="contained"
                    startIcon={link.icon}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        my: 1,
                        width: "80%"
                    }}
                >
                    {link.primary}
                </Button>
            ))}
        </Box>
    );
}
