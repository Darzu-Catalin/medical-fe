import React from 'react';
import { Box, Card, Grid, Typography, Chip } from '@mui/material';
import { 
  EventNote as AppointmentIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduledIcon,
  Cancel as CancelledIcon 
} from '@mui/icons-material';
import { AppointmentType, appointmentStatusMap } from '@/requests/appointments.requests';

interface AppointmentStatsProps {
  appointments: AppointmentType[];
  loading?: boolean;
}

const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments, loading }) => {
  if (loading) {
    return (
      <Card sx={{ p: 1, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading appointment statistics...
        </Typography>
      </Card>
    );
  }

  // Calculate statistics
  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.appointmentDate) >= new Date()
  ).length;
  const completedAppointments = appointments.filter(apt => apt.status === 4).length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 5).length;

  const stats = [
    {
      label: 'Total Appointments',
      value: totalAppointments,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      icon: <AppointmentIcon />,
    },
    {
      label: 'Upcoming',
      value: upcomingAppointments,
      color: '#00796b',
      bgColor: '#e0f7fa',
      icon: <ScheduledIcon />,
    },
    {
      label: 'Completed',
      value: completedAppointments,
      color: '#388e3c',
      bgColor: '#e8f5e9',
      icon: <CompletedIcon />,
    },
    {
      label: 'Cancelled',
      value: cancelledAppointments,
      color: '#d32f2f',
      bgColor: '#ffebee',
      icon: <CancelledIcon />,
    },
  ];

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Appointment Overview
      </Typography>
      
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: stat.bgColor,
                border: `1px solid ${stat.color}20`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: stat.color,
                  color: 'white',
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Recent Appointments Preview */}
      {appointments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Recent Appointments
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {appointments
              .slice(0, 5)
              .map((apt, index) => {
                const statusInfo = appointmentStatusMap[apt.status];
                return (
                  <Chip
                    key={index}
                    label={`Dr. ${apt.doctorName} - ${statusInfo.label}`}
                    size="small"
                    sx={{
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.color,
                      fontSize: '0.75rem',
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default AppointmentStats;