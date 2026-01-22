'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save, Cancel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { 
  DoctorProfile, 
  UpdateDoctorProfilePayload,
  updateDoctorProfile,
  getClinics,
  DoctorSpecialty
} from '@/requests/doctor/doctor.requests';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  doctorProfile: DoctorProfile | null;
  onProfileUpdated: (updatedProfile: DoctorProfile) => void;
}

interface Clinic {
  id: string;
  name: string;
  address?: string;
}

const SPECIALTIES = [
  { label: 'General Practice', value: 0 },
  { label: 'Cardiology', value: 1 },
  { label: 'Neurology', value: 2 },
  { label: 'Pediatrics', value: 3 },
  { label: 'Dermatology', value: 4 },
  { label: 'Orthopedics', value: 5 },
  { label: 'Psychiatry', value: 6 },
  { label: 'Oncology', value: 7 },
  { label: 'Radiology', value: 8 },
  { label: 'Surgery', value: 9 },
  { label: 'Ophthalmology', value: 10 },
  { label: 'ENT', value: 11 },
  { label: 'Urology', value: 12 },
  { label: 'Gynecology', value: 13 },
  { label: 'Endocrinology', value: 14 },
  { label: 'Gastroenterology', value: 15 },
  { label: 'Pulmonology', value: 16 },
  { label: 'Nephrology', value: 17 },
  { label: 'Rheumatology', value: 18 },
  { label: 'Other', value: 99 }
];

const EditProfileDialog = ({ open, onClose, doctorProfile, onProfileUpdated }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<UpdateDoctorProfilePayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      clinicId: '',
      specialty: 0,
      experience: ''
    }
  });

  // Load doctor profile data into form
  useEffect(() => {
    if (doctorProfile && open) {
      // Convert specialty string to enum value
      let specialtyValue = 0; // Default to GeneralPractice
      if (doctorProfile.specialty) {
        // Find matching specialty
        const specialty = SPECIALTIES.find(
          s => s.label.toLowerCase() === doctorProfile.specialty?.toLowerCase()
        );
        specialtyValue = specialty ? specialty.value : 0;
      }

      reset({
        firstName: doctorProfile.firstName || '',
        lastName: doctorProfile.lastName || '',
        phoneNumber: doctorProfile.phoneNumber || '',
        address: doctorProfile.address || '',
        clinicId: doctorProfile.clinicId || '',
        specialty: specialtyValue,
        experience: doctorProfile.experience || ''
      });
    }
  }, [doctorProfile, open, reset]);

  // Load clinics when dialog opens
  useEffect(() => {
    if (open) {
      loadClinics();
    }
  }, [open]);

  const loadClinics = async () => {
    setClinicsLoading(true);
    try {
      const response = await getClinics();
      if (!response.error && response.data) {
        setClinics(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setClinicsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateDoctorProfilePayload) => {
    if (!isDirty) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const response = await updateDoctorProfile(data);
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to update profile', { variant: 'error' });
        return;
      }

      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      
      // Update the profile data with the new values
      if (doctorProfile) {
        const updatedProfile = { ...doctorProfile, ...data };
        onProfileUpdated(updatedProfile);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  if (!doctorProfile) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
          <Button onClick={handleClose} disabled={loading}>
            <Cancel />
          </Button>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    placeholder="+373 XX XXX XXX"
                    disabled={loading}
                  />
                )}
              />
            </Grid>



            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Professional Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold" sx={{ mt: 2 }}>
                Professional Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="specialty"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Specialty</InputLabel>
                    <Select 
                      {...field} 
                      label="Specialty"
                      value={field.value || 0}
                    >
                      {SPECIALTIES.map((specialty) => (
                        <MenuItem key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Years of Experience"
                    fullWidth
                    placeholder="e.g., 5 years"
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="clinicId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={loading || clinicsLoading}>
                    <InputLabel>Clinic/Hospital</InputLabel>
                    <Select {...field} label="Clinic/Hospital">
                      <MenuItem value="">
                        <em>Select a clinic</em>
                      </MenuItem>
                      {clinics.map((clinic) => (
                        <MenuItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                          {clinic.address && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              - {clinic.address}
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                    {clinicsLoading && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="caption">Loading clinics...</Typography>
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Information Alert */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Some information like email, IDNP, and date of birth cannot be modified. 
                  Please contact your administrator for changes to these fields.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            startIcon={<Save />}
            disabled={!isDirty}
          >
            Save Changes
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;