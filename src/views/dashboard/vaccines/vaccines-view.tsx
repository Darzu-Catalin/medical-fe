'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider
} from '@mui/material'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'

interface Vaccine {
  id: string
  patientId: string
  vaccineName: string
  dateAdministered: string
  administeredById: string
  doctorName: string
  batchNumber?: string
  nextDoseDate?: string
  notes?: string
  createdAt: string
}

// Mock vaccine data with existing doctors
const MOCK_VACCINES: Vaccine[] = [
  {
    id: '1',
    patientId: 'dcb822a8-f704-45cf-9808-4e1c45ed6fe7',
    vaccineName: 'COVID-19 (Pfizer-BioNTech)',
    dateAdministered: '2025-12-15',
    administeredById: '1a255720-8692-4903-87fc-f0a39c8284d1',
    doctorName: 'Dr. Caraman Mihai',
    batchNumber: 'PF12345678',
    nextDoseDate: '2026-06-15',
    notes: 'No adverse reactions reported',
    createdAt: '2025-12-15T10:30:00Z'
  },
  {
    id: '2',
    patientId: 'dcb822a8-f704-45cf-9808-4e1c45ed6fe7',
    vaccineName: 'Influenza (Seasonal)',
    dateAdministered: '2025-10-10',
    administeredById: '4c916f8d-c242-49dc-8e42-6ffd251983a3',
    doctorName: 'Dr. Dana Doctor11',
    batchNumber: 'FLU2025-987',
    nextDoseDate: '2026-10-10',
    notes: 'Annual flu shot',
    createdAt: '2025-10-10T14:20:00Z'
  },
  {
    id: '3',
    patientId: 'dcb822a8-f704-45cf-9808-4e1c45ed6fe7',
    vaccineName: 'Tetanus, Diphtheria, Pertussis (Tdap)',
    dateAdministered: '2024-03-22',
    administeredById: '043b7e6e-d72f-4e51-a073-52580b3995fb',
    doctorName: 'Dr. Daniela Cojocari',
    batchNumber: 'TDAP-456789',
    nextDoseDate: '2034-03-22',
    notes: 'Booster dose administered',
    createdAt: '2024-03-22T09:15:00Z'
  },
  {
    id: '4',
    patientId: 'dcb822a8-f704-45cf-9808-4e1c45ed6fe7',
    vaccineName: 'Hepatitis B',
    dateAdministered: '2023-08-05',
    administeredById: '1beacab4-cc6d-4bb1-a919-c7b6a3ebc883',
    doctorName: 'Dr. Anastasia Tdoctor',
    batchNumber: 'HEPB-123456',
    notes: 'Final dose of series',
    createdAt: '2023-08-05T11:00:00Z'
  },
  {
    id: '5',
    patientId: 'dcb822a8-f704-45cf-9808-4e1c45ed6fe7',
    vaccineName: 'MMR (Measles, Mumps, Rubella)',
    dateAdministered: '2022-05-18',
    administeredById: 'b86d97fb-5fb0-47cb-ba08-4b6440bb5ee5',
    doctorName: 'Dr. John Doe',
    batchNumber: 'MMR-789012',
    notes: 'Second dose completed',
    createdAt: '2022-05-18T13:45:00Z'
  }
]

const VACCINE_TYPES = [
  'COVID-19 (Pfizer-BioNTech)',
  'COVID-19 (Moderna)',
  'Influenza (Seasonal)',
  'Tetanus, Diphtheria, Pertussis (Tdap)',
  'Hepatitis A',
  'Hepatitis B',
  'MMR (Measles, Mumps, Rubella)',
  'Varicella (Chickenpox)',
  'HPV (Human Papillomavirus)',
  'Pneumococcal',
  'Meningococcal',
  'Other'
]

export default function VaccinesView() {
  const [vaccines, setVaccines] = useState<Vaccine[]>(MOCK_VACCINES)
  const [addDialog, setAddDialog] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null)
  const { user, userRole } = useAppSelector((state) => state.auth)

  const handleViewDetails = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine)
  }

  const handleCloseDetails = () => {
    setSelectedVaccine(null)
  }

  const isUpcomingDose = (date: string | undefined) => {
    if (!date) return false
    const nextDose = new Date(date)
    const today = new Date()
    const diffTime = nextDose.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 90 // Within next 90 days
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Vaccination Records</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track and manage your immunization history
          </Typography>
        </Box>
        
        {userRole === 'patient' && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:needle" />}
            onClick={() => setAddDialog(true)}
          >
            Add Vaccine Record
          </Button>
        )}
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Iconify icon="mdi:shield-check" width={28} />
                </Avatar>
                <Box>
                  <Typography variant="h4">{vaccines.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Vaccines
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <Iconify icon="mdi:calendar-check" width={28} />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {vaccines.filter(v => new Date(v.dateAdministered).getFullYear() === 2025).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Year
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                  <Iconify icon="mdi:clock-alert-outline" width={28} />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {vaccines.filter(v => isUpcomingDose(v.nextDoseDate)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Doses
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                  <Iconify icon="mdi:doctor" width={28} />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {new Set(vaccines.map(v => v.administeredById)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Providers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vaccine Records */}
      <Stack spacing={2}>
        {vaccines
          .sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime())
          .map((vaccine) => (
            <Card key={vaccine.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 56, height: 56 }}>
                      <Iconify icon="mdi:needle" width={32} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{vaccine.vaccineName}</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="mdi:calendar" width={16} sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(vaccine.dateAdministered).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="mdi:doctor" width={16} sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {vaccine.doctorName}
                          </Typography>
                        </Stack>
                        {vaccine.batchNumber && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Iconify icon="mdi:barcode" width={16} sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {vaccine.batchNumber}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                      {vaccine.nextDoseDate && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            size="small"
                            icon={<Iconify icon="mdi:clock-outline" width={16} />}
                            label={`Next dose: ${new Date(vaccine.nextDoseDate).toLocaleDateString()}`}
                            color={isUpcomingDose(vaccine.nextDoseDate) ? 'warning' : 'default'}
                            variant={isUpcomingDose(vaccine.nextDoseDate) ? 'filled' : 'outlined'}
                          />
                        </Box>
                      )}
                      {vaccine.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {vaccine.notes}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(vaccine)}
                  >
                    Details
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>

      {vaccines.length === 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="mdi:needle" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No vaccination records yet
              </Typography>
              <Typography color="text.secondary">
                Add your vaccination history to keep track of your immunizations
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Add Vaccine Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Vaccine Record</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Vaccine Type"
              fullWidth
            >
              {VACCINE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Date Administered"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <TextField
              label="Batch Number (Optional)"
              fullWidth
            />
            
            <TextField
              label="Next Dose Date (Optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              placeholder="Any reactions, side effects, or additional information..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddDialog(false)}>
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vaccine Details Dialog */}
      <Dialog open={Boolean(selectedVaccine)} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Vaccine Details</DialogTitle>
        <DialogContent>
          {selectedVaccine && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Vaccine Name
                </Typography>
                <Typography variant="body1">{selectedVaccine.vaccineName}</Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date Administered
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedVaccine.dateAdministered).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Administered By
                </Typography>
                <Typography variant="body1">{selectedVaccine.doctorName}</Typography>
              </Box>
              
              {selectedVaccine.batchNumber && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Batch Number
                    </Typography>
                    <Typography variant="body1">{selectedVaccine.batchNumber}</Typography>
                  </Box>
                </>
              )}
              
              {selectedVaccine.nextDoseDate && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Dose Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedVaccine.nextDoseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    {isUpcomingDose(selectedVaccine.nextDoseDate) && (
                      <Chip
                        size="small"
                        label="Upcoming"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </>
              )}
              
              {selectedVaccine.notes && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{selectedVaccine.notes}</Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
