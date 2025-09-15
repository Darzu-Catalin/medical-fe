import { Box, Typography } from '@mui/material'

export const metadata = {
  title: 'Vaccines',
}

export default function VaccinesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Vaccines</Typography>
      <Typography color="text.secondary">Your vaccination records will appear here.</Typography>
    </Box>
  )
}
