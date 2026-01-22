import React, { useState, useEffect } from 'react';
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
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  QueryBuilder as TimeIcon,
  Person as PatientIcon,
  LocalHospital as DoctorIcon,
  Description as NotesIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { appointmentStatusMap, CalendarAppointmentEvent, completeAppointmentWithRecord, canCompleteAppointment } from '@/requests/appointments.requests';
import { useAppSelector } from '@/redux/store';

interface AppointmentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentEvent: CalendarAppointmentEvent | null;
  onAppointmentCompleted?: () => void;
}

const AppointmentDetailDialog: React.FC<AppointmentDetailDialogProps> = ({
  open,
  onClose,
  appointmentEvent,
  onAppointmentCompleted,
}) => {
  const { userRole } = useAppSelector((state) => state.auth);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [completionInfo, setCompletionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [medicalRecord, setMedicalRecord] = useState({
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescription: '',
    notes: '',
  });

  useEffect(() => {
    if (open && appointmentEvent && userRole === 'doctor') {
      checkCompletionStatus();
    }
  }, [open, appointmentEvent, userRole]);

  const checkCompletionStatus = async () => {
    if (!appointmentEvent) return;
    
    setLoading(true);
    const result = await canCompleteAppointment(appointmentEvent.extendedProps.appointmentId);
    setLoading(false);
    
    if (result.success && result.data) {
      setCanComplete(result.data.canComplete);
      setCompletionInfo(result.data);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!appointmentEvent || !medicalRecord.diagnosis.trim()) {
      setError('Diagnosis is required to complete the appointment');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await completeAppointmentWithRecord(
      appointmentEvent.extendedProps.appointmentId,
      medicalRecord
    );

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onAppointmentCompleted?.();
        handleClose();
      }, 1500);
    } else {
      setError(result.error || 'Failed to complete appointment');
    }
  };

  const handleClose = () => {
    setShowMedicalRecordForm(false);
    setMedicalRecord({
      diagnosis: '',
      symptoms: '',
      treatment: '',
      prescription: '',
      notes: '',
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

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

          {/* Show completion status for doctors */}
          {userRole === 'doctor' && completionInfo && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  backgroundColor: canComplete ? '#e8f5e9' : '#fff3e0', 
                  borderRadius: 1, 
                  p: 2,
                  mt: 1,
                  border: 1,
                  borderColor: canComplete ? '#4caf50' : '#ff9800',
                }}
              >
                <Typography variant="body2" fontWeight="500">
                  {completionInfo.message}
                </Typography>
                {canComplete && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Time remaining: {completionInfo.minutesRemaining} minutes
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Medical Record Form */}
        {showMedicalRecordForm && userRole === 'doctor' && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Medical Record
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Appointment completed successfully!
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Diagnosis"
                  multiline
                  rows={2}
                  value={medicalRecord.diagnosis}
                  onChange={(e) => setMedicalRecord({ ...medicalRecord, diagnosis: e.target.value })}
                  disabled={submitting || success}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Symptoms"
                  multiline
                  rows={2}
                  value={medicalRecord.symptoms}
                  onChange={(e) => setMedicalRecord({ ...medicalRecord, symptoms: e.target.value })}
                  disabled={submitting || success}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Treatment"
                  multiline
                  rows={2}
                  value={medicalRecord.treatment}
                  onChange={(e) => setMedicalRecord({ ...medicalRecord, treatment: e.target.value })}
                  disabled={submitting || success}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prescription"
                  multiline
                  rows={2}
                  value={medicalRecord.prescription}
                  onChange={(e) => setMedicalRecord({ ...medicalRecord, prescription: e.target.value })}
                  disabled={submitting || success}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={medicalRecord.notes}
                  onChange={(e) => setMedicalRecord({ ...medicalRecord, notes: e.target.value })}
                  disabled={submitting || success}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!showMedicalRecordForm && userRole === 'doctor' && canComplete && extendedProps.status !== 4 && (
          <Button
            onClick={() => setShowMedicalRecordForm(true)}
            variant="contained"
            color="success"
            startIcon={<CompleteIcon />}
            sx={{ minWidth: 150 }}
          >
            Complete Appointment
          </Button>
        )}
        
        {showMedicalRecordForm && (
          <>
            <Button 
              onClick={() => setShowMedicalRecordForm(false)} 
              variant="outlined"
              disabled={submitting || success}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteAppointment}
              variant="contained"
              color="success"
              disabled={submitting || success || !medicalRecord.diagnosis.trim()}
              startIcon={submitting ? <CircularProgress size={20} /> : <CompleteIcon />}
              sx={{ minWidth: 150 }}
            >
              {submitting ? 'Completing...' : 'Complete & Save'}
            </Button>
          </>
        )}
        
        {!showMedicalRecordForm && (
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            color="primary"
            sx={{ minWidth: 100 }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailDialog;