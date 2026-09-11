// Platform icons
import RenderPlatformIcon from "@/features/games/components/PlatformIcons";

// Others
import { PLATFORM_IDS } from "@/features/games/components/PlatformIcons";
import Box from '@mui/material/Box';

// Types
import type { ValueOptions } from "@mui/x-data-grid"

type Props = { 
    idx: number    
}

function RenderEntry(props: Props) {
    const {idx} = props;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center"
            }}>
            <RenderPlatformIcon identifier={idx} />
        </Box>
    );
}

const options : ValueOptions[] = PLATFORM_IDS.map( (platformId) => ({
    value: platformId,
    label: <RenderEntry idx={platformId}/>
}));

// Default export
export default options;
