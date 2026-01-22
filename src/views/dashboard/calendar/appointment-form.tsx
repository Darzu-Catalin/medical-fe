import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetDoctors, DoctorType, fetchDoctorAvailability } from '@/requests/appointments.requests';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { useSnackbar } from 'src/components/ui/minimals/snackbar';
import FormProvider, { RHFTextField } from 'src/components/ui/minimals/hook-form';

import { ICalendarRange } from 'src/types/calendar';

// ----------------------------------------------------------------------

const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
];

const STATUS_OPTIONS = [
  { value: 1, label: 'Scheduled' },
  { value: 2, label: 'Confirmed' },
  { value: 3, label: 'In Progress' },
  { value: 4, label: 'Completed' },
  { value: 5, label: 'Cancelled' },
];

// ----------------------------------------------------------------------

type Props = {
  selectedRange: ICalendarRange;
  onClose: VoidFunction;
  onSubmit: (data: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    duration: number;
    reason?: string;
    notes?: string;
  }) => void;
};

type FormValues = {
  doctorId: string;
  appointmentDate: Date;
  duration: number;
  reason: string;
  notes: string;
  status: number;
};

export default function AppointmentForm({ selectedRange, onClose, onSubmit }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  
  // Get current user from Redux
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Fetch doctors from API
  const { doctors, doctorsLoading, doctorsError } = useGetDoctors();
  
  // State for available slots
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const AppointmentSchema = Yup.object().shape({
    doctorId: Yup.string().required('Please select a doctor'),
    appointmentDate: Yup.date().required('Please select a date and time'),
    duration: Yup.number().required('Please select a duration').min(15),
    reason: Yup.string().default(''),
    notes: Yup.string().default(''),
    status: Yup.number().required('Please select a status'),
  });

  const defaultValues: FormValues = {
    doctorId: '',
    appointmentDate: selectedRange?.start || new Date(),
    duration: 30,
    reason: '',
    notes: '',
    status: 1,
  };

  const methods = useForm<FormValues>({
    resolver: yupResolver(AppointmentSchema) as any,
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const selectedDoctorId = watch('doctorId');
  const appointmentDate = watch('appointmentDate');
  const selectedDoctor = doctors.find(d => d.id.toString() === selectedDoctorId);

  // Fetch available slots when doctor and date change
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDoctorId && appointmentDate) {
        setLoadingSlots(true);
        try {
          const dateStr = appointmentDate.toISOString().split('T')[0];
          const slots = await fetchDoctorAvailability(selectedDoctorId, dateStr);
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Error fetching slots:', error);
          setAvailableSlots([]);
        }
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const doctor = doctors.find(d => d.id.toString() === data.doctorId);
      
      if (!doctor) {
        enqueueSnackbar('Please select a valid doctor', { variant: 'error' });
        return;
      }

      // Get patient ID from current user
      const patientId = currentUser?.id?.toString() || '';
      
      if (!patientId) {
        enqueueSnackbar('Nu s-a putut identifica pacientul. Vă rugăm să vă autentificați din nou.', { variant: 'error' });
        return;
      }

      const appointmentData = {
        patientId,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate.toISOString(),
        duration: data.duration,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
      };

      onSubmit(appointmentData);
      enqueueSnackbar('Programare adăugată cu succes!', { variant: 'success' });
    } catch (error) {
      console.error('Error creating appointment:', error);
      enqueueSnackbar('A apărut o eroare la crearea programării', { variant: 'error' });
    }
  });

  // Show loading state while fetching doctors
  if (doctorsLoading) {
    return (
      <Stack spacing={3} sx={{ px: 3, py: 4 }} alignItems="center">
        <CircularProgress />
        <Box sx={{ color: 'text.secondary' }}>Loading doctors...</Box>
      </Stack>
    );
  }

  // Show error if doctors failed to load
  if (doctorsError) {
    return (
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Alert severity="error">
          Failed to load doctors. Please try again later.
        </Alert>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Stack>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={handleFormSubmit}>
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Controller
          name="doctorId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Selectează Doctor *"
              error={!!errors.doctorId}
              helperText={errors.doctorId?.message}
            >
              <MenuItem value="">
                <em>Selectează un doctor</em>
              </MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id.toString()}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {selectedDoctor && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderColor: 'primary.light',
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                <strong>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</strong>
                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {selectedDoctor.specialty}
                </Box>
              </Box>
            </Stack>
          </Box>
        )}

        <Controller
          name="appointmentDate"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={field.value}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(newValue);
                }
              }}
              ampm={false}
              label="Data și ora programării *"
              format="dd/MM/yyyy HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          )}
        />

        {/* Show available slots if any */}
        {loadingSlots && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Loading available slots...
            </Box>
          </Box>
        )}
        
        {!loadingSlots && availableSlots.length > 0 && (
          <Box>
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 1 }}>
              Available slots for this day:
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableSlots.slice(0, 6).map((slot, index) => (
                <Chip 
                  key={index} 
                  label={slot} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ))}
              {availableSlots.length > 6 && (
                <Chip 
                  label={`+${availableSlots.length - 6} more`} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        <Controller
          name="duration"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Durată *"
              error={!!errors.duration}
              helperText={errors.duration?.message}
            >
              {DURATIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Status"
              error={!!errors.status}
              helperText={errors.status?.message}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <RHFTextField 
          name="reason" 
          label="Motiv programare" 
          multiline 
          rows={2}
          placeholder="ex: Consultație de rutină, Durere de cap, etc."
        />

        <RHFTextField 
          name="notes" 
          label="Note adiționale" 
          multiline 
          rows={2}
          placeholder="Informații suplimentare pentru doctor..."
        />
      </Stack>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Anulează
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Salvează programarea
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
