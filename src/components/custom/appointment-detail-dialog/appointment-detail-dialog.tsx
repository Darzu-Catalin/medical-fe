import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  QueryBuilder as TimeIcon,
  Person as PatientIcon,
  LocalHospital as DoctorIcon,
  Description as NotesIcon,
} from '@mui/icons-material';
import { appointmentStatusMap, CalendarAppointmentEvent } from '@/requests/appointments.requests';

interface AppointmentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentEvent: CalendarAppointmentEvent | null;
}

const AppointmentDetailDialog: React.FC<AppointmentDetailDialogProps> = ({
  open,
  onClose,
  appointmentEvent,
}) => {
  if (!appointmentEvent) return null;

  const { extendedProps } = appointmentEvent;
  const statusInfo = appointmentStatusMap[extendedProps.status] || appointmentStatusMap[1];
  
  // Format date and time
  const appointmentDate = new Date(appointmentEvent.start);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '500px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Appointment Details
          </Typography>
          <Chip
            label={statusInfo.label}
            sx={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={3}>
          {/* Doctor Information */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <DoctorIcon sx={{ mr: 2, color: '#1976d2' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Dr. {extendedProps.doctorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {extendedProps.specialty}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Date and Time */}
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarIcon sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Date
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="500">
              {formattedDate}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <TimeIcon sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Time
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="500">
              {formattedTime} ({extendedProps.duration || 30} min)
            </Typography>
          </Grid>

          {/* Reason */}
          {extendedProps.reason && (
            <>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <PatientIcon sx={{ mr: 1, color: '#757575', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    Reason for Visit
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {extendedProps.reason}
                </Typography>
              </Grid>
            </>
          )}

          {/* Notes */}
          {extendedProps.notes && (
            <>
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <NotesIcon sx={{ mr: 1, color: '#757575', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    Notes
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {extendedProps.notes}
                </Typography>
              </Grid>
            </>
          )}

          {/* Appointment ID (for reference) */}
          <Grid item xs={12}>
            <Box 
              sx={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1, 
                p: 2,
                mt: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Appointment ID: {extendedProps.appointmentId}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="primary"
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailDialog;