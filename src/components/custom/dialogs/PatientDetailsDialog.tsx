'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  LocalHospital,
  Close
} from '@mui/icons-material';

interface Patient {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhoneNumber: string;
  patientIDNP: string;
  bloodType: string;
  dateOfBirth: string;
  assignedDate: string;
  isActive: boolean;
  notes?: string;
  assignedBy?: string;
  lastVisit?: string;
  totalVisits: number;
}

interface PatientDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const PatientDetailsDialog = ({ open, onClose, patient }: PatientDetailsDialogProps) => {
  if (!patient) return null;

  const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography color="text.secondary" fontWeight="medium">
          {label}
        </Typography>
      </Box>
      <Typography fontWeight="600">{value}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {patient.patientName?.split(' ')[0]?.[0]}{patient.patientName?.split(' ')[1]?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {patient.patientName}
              </Typography>
              <Chip
                label={patient.isActive ? 'Active Patient' : 'Inactive'}
                color={patient.isActive ? 'success' : 'default'}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" mb={2}>
                Personal Information
              </Typography>

              <InfoRow
                label="Full Name"
                value={patient.patientName}
                icon={<Person fontSize="small" color="action" />}
              />
              <Divider />

              <InfoRow
                label="IDNP"
                value={patient.patientIDNP || 'Not provided'}
                icon={<Person fontSize="small" color="action" />}
              />
              <Divider />

              <InfoRow
                label="Date of Birth"
                value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                icon={<CalendarToday fontSize="small" color="action" />}
              />
              <Divider />

              <InfoRow
                label="Blood Type"
                value={patient.bloodType || 'Unknown'}
                icon={<LocalHospital fontSize="small" color="action" />}
              />
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" mb={2}>
                Contact Information
              </Typography>

              <InfoRow
                label="Email"
                value={patient.patientEmail || 'Not provided'}
                icon={<Email fontSize="small" color="action" />}
              />
              <Divider />

              <InfoRow
                label="Phone Number"
                value={patient.patientPhoneNumber || 'Not provided'}
                icon={<Phone fontSize="small" color="action" />}
              />
            </Box>
          </Grid>

          {/* Care Information */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" mb={2}>
                Care Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    label="Assigned Date"
                    value={new Date(patient.assignedDate).toLocaleDateString()}
                    icon={<CalendarToday fontSize="small" color="action" />}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoRow
                    label="Total Visits"
                    value={patient.totalVisits}
                    icon={<LocalHospital fontSize="small" color="action" />}
                  />
                </Grid>

                {patient.lastVisit && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow
                      label="Last Visit"
                      value={new Date(patient.lastVisit).toLocaleDateString()}
                      icon={<CalendarToday fontSize="small" color="action" />}
                    />
                  </Grid>
                )}

                {patient.assignedBy && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow
                      label="Assigned By"
                      value={patient.assignedBy}
                      icon={<Person fontSize="small" color="action" />}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Notes */}
          {patient.notes && (
            <Grid item xs={12}>
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" mb={2}>
                  Notes
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {patient.notes}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" startIcon={<Close />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetailsDialog;
