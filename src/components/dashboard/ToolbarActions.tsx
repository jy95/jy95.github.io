'use client';

// Hooks
import dynamic from 'next/dynamic'
import { useState, Suspense } from "react";

// Components
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { Link } from '@/i18n/routing';
const ThemeMode = dynamic(() => import("./ThemeModeToggle"));
const LanguageToggle = dynamic(() => import("./LanguageToggle")); 
const Drawer = dynamic(() => import('@mui/material/Drawer'));

// Icons
import SettingsIcon from '@mui/icons-material/Settings';

// https://mui.com/toolpad/core/react-dashboard-layout/#slots
// https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually

// Labels
import type { Props } from './types';

export default function ToolbarActions(props: Props){

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen((previousIsMenuOpen) => !previousIsMenuOpen);

    return (
        <>
            <IconButton aria-label={props.settingsLabel} onClick={toggleMenu}>
                <SettingsIcon />
            </IconButton>
            <Suspense fallback={null}>
                <Drawer 
                    open={isMenuOpen} 
                    onClose={toggleMenu}
                    anchor="right"
                >
                    <Box sx={{ pl: 2, pr: 2, py: 10 }}>
                        <ThemeMode {...props} />
                        <LanguageToggle {...props} />
                        {/* Footer Links */}
                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/privacy.html">Privacy Policy</Link>
                            <Link href="/tos.html">Terms of Service</Link>
                        </Box>
                    </Box>
                </Drawer>
            </Suspense>
        </>
    )

}
