"use client";

// Hooks
import { useTranslations } from "next-intl";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HelpIcon from '@mui/icons-material/Help';

import type { AppConfig } from 'next-intl';
import type { BackgroundColor } from "./index";

type Ranking = keyof AppConfig["Messages"]["TierList"]["categories"]

interface DisclaimerAccordionProps {
    categoryColors: Record<Ranking, BackgroundColor>;
}

export default function DisclaimerAccordion({ categoryColors } : DisclaimerAccordionProps) {

    // Display texts in user's language
    const tDisclaimer = useTranslations("TierList.disclaimer");
    const tCategories = useTranslations("TierList.categories");
    const tDescriptions = useTranslations("TierList.descriptions");

    const tierKeys : Ranking[] = [
        "tier_masterpiece",
        "tier_excellent",
        "tier_good",
        "tier_average",
        "tier_poor",
        "tier_bad",
        "tier_not_evaluated"
    ];

    return (
        <Accordion>
            <AccordionSummary
                id="tier-list-disclaimer-header" 
                aria-controls="tier-list-disclaimer-content" 
                expandIcon={<ExpandMoreIcon />}
            >
                <HelpIcon color="info" sx={{ mr: 1.5 }} />
                <Typography>
                    { tDisclaimer("title") }
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    { tDisclaimer("text") }
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <List disablePadding>
                        {tierKeys.map((key) => (
                            <ListItem key={key}>
                                <ListItemAvatar>
                                    <Avatar variant="circular" sx={{ backgroundColor: categoryColors[key] }}>
                                        <SportsEsportsIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={ tCategories(key) } secondary={ tDescriptions(key) } />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
