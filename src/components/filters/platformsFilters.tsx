// Platform icons
import RenderPlatformIcon from "@/components/GamesView/PlatformIcons";

// Others
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

// In theory, we should use useGetPlatforms for that, but mui doesn't allow that with async
// Platform start from 1 ("PC") to 7 ("SCUMMVM")
const platformsIds : number[] = [1,2,3,4,5,6,7];

const options : ValueOptions[] = platformsIds.map( (platformId) => ({
    value: platformId,
    label: <RenderEntry idx={platformId}/>
}));

// Default export
export default options;
