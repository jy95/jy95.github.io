import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} GamesPassionFR
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Link 
          href="/privacy.html" 
          target="_blank" 
          sx={{ mx: 1, textDecoration: 'none' }} 
          variant="caption"
        >
          Privacy Policy
        </Link>
        <Link 
          href="/tos.html" 
          target="_blank" 
          sx={{ mx: 1, textDecoration: 'none' }} 
          variant="caption"
        >
          Terms of Service
        </Link>
        <Link 
          href="mailto:gamespassionfr.pro@gmail.com" 
          sx={{ mx: 1, textDecoration: 'none' }} 
          variant="caption"
        >
          Contact
        </Link>
      </Box>
    </Box>
  );
}
