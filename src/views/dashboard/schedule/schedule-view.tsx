'use client'

import { useState, useEffect } from 'react'
import { enqueueSnackbar } from 'notistack'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  getDoctorScheduleRequest,
  getAllDoctorAppointmentsRequest,
  AppointmentType,
  appointmentStatusMap,
  CalendarEventFromAPI
} from '@/requests/appointments.requests'

interface ScheduleSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  appointment?: AppointmentType
}

interface TimeSlotForm {
  date: Date
  startTime: Date
  endTime: Date
  duration: number
  breakBetween: number
}

export default function ScheduleView() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeSlotDialog, setTimeSlotDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [formData, setFormData] = useState<TimeSlotForm>({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    duration: 30,
    breakBetween: 15
  })
  
  const { user } = useAppSelector((state) => state.auth)

  const fetchScheduleData = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const [scheduleResponse, appointmentsResponse] = await Promise.all([
        getDoctorScheduleRequest(user.id.toString()),
        getAllDoctorAppointmentsRequest({ doctorId: user.id.toString() })
      ])

      if (scheduleResponse.error) {
        setError(scheduleResponse.error || 'Failed to load schedule')
      } else {
        setSchedule(scheduleResponse.data || [])
      }

      if (!appointmentsResponse.error && appointmentsResponse.data) {
        // Convert CalendarEventFromAPI to AppointmentType
        const convertedAppointments: AppointmentType[] = appointmentsResponse.data.map((event: CalendarEventFromAPI) => ({
          id: event.id,
          patientId: event.patientId || '',
          doctorId: event.doctorId || '',
          patientName: event.patientName || '',
          doctorName: event.doctorName || '',
          specialty: event.specialty || '',
          appointmentDate: event.start,
          duration: event.duration || 30,
          status: event.status || 1,
          reason: event.reason,
          notes: event.notes,
          createdAt: event.start,
        }))
        setAppointments(convertedAppointments)
      }

      setError(null)
    } catch (err) {
      setError('Failed to load schedule data')
      enqueueSnackbar('Failed to load schedule data', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduleData()
  }, [user])

  const generateTimeSlots = () => {
    // This would typically call an API to generate time slots
    enqueueSnackbar('Time slots generation would be implemented with backend API', { variant: 'info' })
    setTimeSlotDialog(false)
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.filter(apt => 
      format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === dateStr
    )
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd, yyyy')
  }

  const getTimeSlots = () => {
    const slots: { time: string; appointment?: AppointmentType }[] = []
    
    // Generate hourly slots from 8 AM to 6 PM
    for (let hour = 8; hour < 18; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`
      const appointment = getAppointmentsForDate(selectedDate).find(apt => 
        format(new Date(apt.appointmentDate), 'HH:mm') === timeStr
      )
      
      slots.push({ time: timeStr, appointment })
    }
    
    return slots
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">My Schedule</Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={fetchScheduleData}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:calendar-plus" />}
              onClick={() => setTimeSlotDialog(true)}
            >
              Set Availability
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Date Navigation */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Calendar
                </Typography>
                <DatePicker
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate || new Date())}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
                
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quick Navigation
                  </Typography>
                  <Button
                    variant={isToday(selectedDate) ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedDate(new Date())}
                    fullWidth
                  >
                    Today
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                    fullWidth
                  >
                    Tomorrow
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule View */}
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Schedule for {getDateLabel(selectedDate)}
                  </Typography>
                  
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`${getAppointmentsForDate(selectedDate).length} appointments`}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  {getTimeSlots().map((slot) => (
                    <Paper
                      key={slot.time}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: slot.appointment ? 'primary.main' : 'grey.300',
                        bgcolor: slot.appointment ? 'primary.lighter' : 'transparent'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" sx={{ minWidth: 60 }}>
                            {slot.time}
                          </Typography>
                          
                          {slot.appointment ? (
                            <Stack>
                              <Typography variant="body2">
                                {slot.appointment.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {slot.appointment.reason}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Available
                            </Typography>
                          )}
                        </Stack>
                        
                        {slot.appointment && (
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={appointmentStatusMap[slot.appointment.status]?.label || 'Unknown'}
                              color={
                                slot.appointment.status === 2 ? 'success' :
                                slot.appointment.status === 1 ? 'warning' : 'default'
                              }
                              size="small"
                            />
                            <IconButton size="small">
                              <Iconify icon="mdi:eye" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                {getTimeSlots().length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Iconify icon="mdi:calendar-blank" sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No schedule set for this date
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Set Availability Dialog */}
        <Dialog open={timeSlotDialog} onClose={() => setTimeSlotDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Set Availability</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Appointment Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(newValue) => setFormData({ ...formData, startTime: newValue || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(newValue) => setFormData({ ...formData, endTime: newValue || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Break Between Appointments (minutes)"
                  type="number"
                  value={formData.breakBetween}
                  onChange={(e) => setFormData({ ...formData, breakBetween: parseInt(e.target.value) || 15 })}
                  fullWidth
                  helperText="Time buffer between consecutive appointments"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimeSlotDialog(false)}>Cancel</Button>
            <LoadingButton
              variant="contained"
              onClick={generateTimeSlots}
              loading={submitting}
            >
              Generate Time Slots
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}