// https://next-intl-docs.vercel.app/docs/environments/error-files#not-foundjs

// https://next-intl-docs.vercel.app/docs/routing/navigation
import { Link } from '@/i18n/routing';

// Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default async function NotFoundPage() {

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "80vh"
            }}>
            <Typography variant="h4" gutterBottom>{"We couldn't find that page"}</Typography>
            <Link href="/">
                <Button variant="contained" color="primary">
                    {"Return home"}
                </Button>
            </Link>
        </Box>
    );
}