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
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Grid,
  Paper,
  Autocomplete
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  getDoctorRatingsRequest,
  getPatientRatingsRequest,
  addRatingRequest,
  RatingData 
} from '@/requests/ratings/ratings.requests'
import { useGetDoctors } from '@/requests/appointments.requests'

interface RatingFormData {
  doctorId: string
  rating: number
  comment: string
}

export default function RatingsView() {
  const [ratings, setRatings] = useState<RatingData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratingDialog, setRatingDialog] = useState(false)
  const [formData, setFormData] = useState<RatingFormData>({
    doctorId: '',
    rating: 0,
    comment: ''
  })
  
  const { user, userRole } = useAppSelector((state) => state.auth)
  const { doctors, doctorsLoading } = useGetDoctors()

  const fetchRatings = async () => {
    setLoading(true)
    console.log('🔍 Fetching ratings...', { userRole, userId: user?.id, doctorsCount: doctors.length })
    try {
      let response
      if (userRole === 'doctor' && user?.id) {
        // Doctor sees their own ratings
        response = await getDoctorRatingsRequest(user.id.toString())
        // Extract ratings array from the response (it's at top level, has structure { doctorId, averageRating, ratingsCount, ratings })
        if (response?.ratings) {
          response = { success: true, data: response.ratings }
        }
      } else if (userRole === 'patient' && user?.id) {
        // Patient sees ratings they submitted
        // Wait for doctors to load first
        if (doctorsLoading || doctors.length === 0) {
          console.log('⏳ Waiting for doctors to load...', { doctorsLoading, doctorsLength: doctors.length })
          setLoading(false)
          return
        }
        
        console.log('👨‍⚕️ Fetching ratings from', doctors.length, 'doctors')
        
        // Fetch all doctors and check each one for this patient's ratings
        const allRatings: RatingData[] = []
        
        for (const doctor of doctors) {
          try {
            console.log(`Checking doctor ${doctor.id}: ${doctor.firstName} ${doctor.lastName}`)
            const doctorRatingsResponse = await getDoctorRatingsRequest(doctor.id.toString())
            console.log(`Doctor ${doctor.id} full response:`, doctorRatingsResponse)
            
            // The response already has the structure { doctorId, averageRating, ratingsCount, ratings: [...] } at top level
            const ratingsArray = doctorRatingsResponse?.ratings || []
            console.log(`Ratings array for doctor ${doctor.id}:`, ratingsArray)
            
            // Filter to only include ratings from current patient
            const patientRatings = ratingsArray.filter(
              (r: RatingData) => {
                const ratingPatientId = r.patientId?.toString().toLowerCase()
                const currentUserId = user.id?.toString().toLowerCase()
                console.log(`Comparing: "${ratingPatientId}" === "${currentUserId}"`, r.patientId === user.id)
                return ratingPatientId === currentUserId
              }
            )
            
            console.log(`Found ${patientRatings.length} ratings for current patient from doctor ${doctor.id}`)
            
            // Add doctor name to each rating for display
            patientRatings.forEach((r: any) => {
              r.doctorName = `${doctor.firstName} ${doctor.lastName}`
            })
            
            allRatings.push(...patientRatings)
          } catch (err) {
            // Skip doctors that fail
            console.error(`Failed to fetch ratings for doctor ${doctor.id}`, err)
          }
        }
        
        console.log('✅ Total ratings found:', allRatings.length, allRatings)
        response = { success: true, data: allRatings }
      } else {
        response = { success: true, data: [] }
      }

      if (response.error) {
        setError(response.message || 'Failed to load ratings')
      } else {
        setRatings(response.data || [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to load ratings')
      enqueueSnackbar('Failed to load ratings', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole === 'patient' && doctorsLoading) {
      // Wait for doctors to load
      return
    }
    fetchRatings()
  }, [user, userRole, doctors, doctorsLoading])

  const handleSubmitRating = async () => {
    if (!formData.doctorId || formData.rating === 0) {
      enqueueSnackbar('Please select a doctor and provide a rating', { variant: 'error' })
      return
    }

    if (!user?.id) {
      enqueueSnackbar('User not authenticated', { variant: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const response = await addRatingRequest({
        ...formData,
        patientId: user.id.toString()
      })
      
      if (response.error) {
        enqueueSnackbar(response.message || 'Failed to submit rating', { variant: 'error' })
      } else {
        enqueueSnackbar('Rating submitted successfully', { variant: 'success' })
        setRatingDialog(false)
        setFormData({ doctorId: '', rating: 0, comment: '' })
        fetchRatings()
      }
    } catch (err) {
      enqueueSnackbar('Failed to submit rating', { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.ratingNr, 0)
    return sum / ratings.length
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // for 1-5 stars
    ratings.forEach(rating => {
      if (rating.ratingNr >= 1 && rating.ratingNr <= 5) {
        distribution[rating.ratingNr - 1]++
      }
    })
    return distribution
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          {userRole === 'doctor' ? 'My Ratings' : 'Doctor Ratings'}
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:refresh" />}
            onClick={fetchRatings}
          >
            Refresh
          </Button>
          
          {userRole === 'patient' && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:star-plus" />}
              onClick={() => setRatingDialog(true)}
            >
              Add Rating
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {userRole === 'doctor' && ratings.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Average Rating
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                <Typography variant="h3" color="primary">
                  {calculateAverageRating().toFixed(1)}
                </Typography>
                <Rating value={calculateAverageRating()} readOnly precision={0.1} />
              </Box>
              <Typography color="text.secondary">
                Based on {ratings.length} review{ratings.length !== 1 ? 's' : ''}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rating Distribution
              </Typography>
              {getRatingDistribution().map((count, index) => (
                <Box key={index} display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {index + 1}
                  </Typography>
                  <Rating value={1} max={1} readOnly size="small" />
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: 'primary.main',
                        width: ratings.length > 0 ? `${(count / ratings.length) * 100}%` : '0%'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {ratings.length === 0 && !error ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Iconify icon="mdi:star-outline" sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {userRole === 'doctor' ? 'No ratings received yet' : 'No ratings to display'}
              </Typography>
              <Typography color="text.secondary">
                {userRole === 'doctor' 
                  ? 'Patients will be able to rate your services after appointments'
                  : 'Rate doctors after your appointments to help others'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {ratings.map((rating) => (
            <Card key={rating.ratingId}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar>
                    {userRole === 'doctor' 
                      ? (rating.patientName?.[0] || 'P')
                      : ((rating as any).doctorName?.[0] || 'D')
                    }
                  </Avatar>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      <Typography variant="subtitle1">
                        {userRole === 'doctor' 
                          ? (rating.patientName || 'Anonymous Patient')
                          : ((rating as any).doctorName || 'Doctor')
                        }
                      </Typography>
                      <Rating value={rating.ratingNr} readOnly size="small" />
                      <Chip label={`${rating.ratingNr}/5`} size="small" color="primary" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    {rating.ratingCommentary && (
                      <Typography variant="body2" color="text.secondary">
                        {rating.ratingCommentary}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add Rating Dialog */}
      <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Autocomplete
              options={doctors}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${option.specialty}`}
              value={doctors.find(d => d.id.toString() === formData.doctorId) || null}
              onChange={(_, newValue) => {
                setFormData({ ...formData, doctorId: newValue ? newValue.id.toString() : '' })
              }}
              loading={doctorsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Doctor"
                  helperText="Choose the doctor you want to rate"
                  required
                />
              )}
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Rating *
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(_, newValue) => setFormData({ ...formData, rating: newValue || 0 })}
                size="large"
              />
            </Box>
            
            <TextField
              label="Comment (Optional)"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              multiline
              rows={4}
              fullWidth
              placeholder="Share your experience with this doctor..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmitRating}
            loading={submitting}
            disabled={formData.rating === 0 || !formData.doctorId}
          >
            Submit Rating
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}