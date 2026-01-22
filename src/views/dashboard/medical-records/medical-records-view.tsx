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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
  MenuItem
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  getPatientMedicalRecordsRequest,
  createMedicalRecordRequest,
  MedicalRecord 
} from '@/requests/patient/patient.requests'
import { getDoctorMedicalRecords } from '@/requests/doctor/doctor.requests'

interface MedicalRecordForm {
  patientId: string
  diagnosis: string
  treatment: string
  medications: string
  notes: string
  recordDate: Date
  recordType: string
}

const RECORD_TYPES = [
  'Consultation',
  'Diagnosis',
  'Treatment',
  'Surgery',
  'Lab Results',
  'Prescription',
  'Follow-up',
  'Emergency',
  'Other'
]

export default function MedicalRecordsView() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createDialog, setCreateDialog] = useState(false)
  const [formData, setFormData] = useState<MedicalRecordForm>({
    patientId: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    recordDate: new Date(),
    recordType: 'Consultation'
  })
  
  const { user, userRole } = useAppSelector((state) => state.auth)

  const fetchMedicalRecords = async () => {
    setLoading(true)
    try {
      let response
      let recordsData = []
      
      if (userRole === 'patient' && user?.id) {
        // Patient sees their own medical records
        response = await getPatientMedicalRecordsRequest(user.id.toString())
        // Extract records from patient endpoint response
        if (response.success && response.data?.data) {
          recordsData = Array.isArray(response.data.data) ? response.data.data : []
        } else if (response.success && Array.isArray(response.data)) {
          recordsData = response.data
        }
      } else if (userRole === 'doctor') {
        // Doctor sees all medical records they created
        response = await getDoctorMedicalRecords(1, 50)
        
        // The backend returns: { success: true, message: "...", data: { medicalRecords: [...], pagination: {} } }
        // After ApiResponse.success wrapping: { success: true, data: { success: true, data: { medicalRecords: [...] } } }
        if (response.success && response.data?.data?.medicalRecords) {
          recordsData = response.data.data.medicalRecords
        } else if (response.success && response.data?.medicalRecords) {
          recordsData = response.data.medicalRecords
        } else if (response.success && Array.isArray(response.data)) {
          recordsData = response.data
        }
      } else {
        recordsData = []
      }

      if (response?.error) {
        setError(response.message || 'Failed to load medical records')
        setRecords([])
      } else {
        setRecords(Array.isArray(recordsData) ? recordsData : [])
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching medical records:', err)
      setError('Failed to load medical records')
      setRecords([])
      enqueueSnackbar('Failed to load medical records', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalRecords()
  }, [user, userRole])

  const handleCreateRecord = async () => {
    if (!formData.patientId || !formData.diagnosis) {
      enqueueSnackbar('Please fill in required fields', { variant: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const recordData = {
        ...formData,
        recordDate: formData.recordDate.toISOString()
      }

      const response = await createMedicalRecordRequest(recordData)
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to create medical record', { variant: 'error' })
      } else {
        enqueueSnackbar('Medical record created successfully', { variant: 'success' })
        setCreateDialog(false)
        setFormData({
          patientId: '',
          diagnosis: '',
          treatment: '',
          medications: '',
          notes: '',
          recordDate: new Date(),
          recordType: 'Consultation'
        })
        fetchMedicalRecords()
      }
    } catch (err) {
      enqueueSnackbar('Failed to create medical record', { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getRecordTypeColor = (type: string) => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      'Consultation': 'primary',
      'Diagnosis': 'info',
      'Treatment': 'success',
      'Surgery': 'error',
      'Lab Results': 'warning',
      'Prescription': 'secondary',
      'Follow-up': 'info',
      'Emergency': 'error',
      'Other': 'default' as any
    }
    return colorMap[type] || 'default' as any
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
          <Typography variant="h4">
            {userRole === 'patient' ? 'My Medical Records' : 'Medical Records'}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={fetchMedicalRecords}
            >
              Refresh
            </Button>
            
            {userRole === 'doctor' && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={() => setCreateDialog(true)}
              >
                Add Record
              </Button>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {records.length === 0 && !error ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Iconify icon="mdi:file-medical-outline" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No medical records found
                </Typography>
                <Typography color="text.secondary">
                  {userRole === 'doctor' 
                    ? 'Create medical records for your patients'
                    : 'Your medical records will appear here'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Treatment</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.recordDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.recordType} 
                        color={getRecordTypeColor(record.recordType)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{record.treatment || '-'}</TableCell>
                    <TableCell>{record.doctorName || 'Unknown'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Iconify icon="mdi:eye" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create Medical Record Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Medical Record</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Patient ID"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Record Type"
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  select
                  fullWidth
                >
                  {RECORD_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Record Date"
                  value={formData.recordDate}
                  onChange={(newValue) => setFormData({ ...formData, recordDate: newValue || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <LoadingButton
              variant="contained"
              onClick={handleCreateRecord}
              loading={submitting}
              disabled={!formData.patientId || !formData.diagnosis}
            >
              Create Record
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}