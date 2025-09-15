import { Box, Typography } from '@mui/material'

export const metadata = {
  title: 'Audit Log',
}

export default function AuditLogPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Audit Log</Typography>
      <Typography color="text.secondary">Your account activity will appear here.</Typography>
    </Box>
  )
}
