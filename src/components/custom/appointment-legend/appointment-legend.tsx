import React from 'react';
import { Box, Card, Typography, Chip } from '@mui/material';
import { appointmentStatusMap } from '@/requests/appointments.requests';

const AppointmentLegend: React.FC = () => {
  const statusEntries = Object.entries(appointmentStatusMap);

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Appointment Status Legend
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {statusEntries.map(([statusCode, statusInfo]) => (
          <Chip
            key={statusCode}
            label={statusInfo.label}
            size="small"
            sx={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              fontSize: '0.75rem',
              fontWeight: 500,
              border: `1px solid ${statusInfo.color}30`,
            }}
          />
        ))}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click on any appointment in the calendar to view detailed information
      </Typography>
    </Card>
  );
};

export default AppointmentLegend;