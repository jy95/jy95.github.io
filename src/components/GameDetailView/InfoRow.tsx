import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function InfoRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <Box>
            <Typography 
                variant="caption" 
                sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 'bold', 
                    display: 'block', 
                    letterSpacing: 0.5,
                    mb: 0.5 
                }}
            >
                {label}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                    {icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {value}
                </Typography>
            </Stack>
        </Box>
    );
}

export default InfoRow;