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
  Paper
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Iconify from '@/components/ui/minimals/iconify'
import { useAppSelector } from '@/redux/store'
import { 
  getDoctorRatingsRequest,
  addRatingRequest,
  RatingData 
} from '@/requests/ratings/ratings.requests'

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

  const fetchRatings = async () => {
    setLoading(true)
    try {
      let response
      if (userRole === 'doctor' && user?.id) {
        // Doctor sees their own ratings
        response = await getDoctorRatingsRequest(user.id.toString())
      } else if (userRole === 'patient') {
        // Patient could see ratings for all doctors or their submitted ratings
        // For now, we'll show empty state and let them add new ratings
        response = { success: true, data: [] }
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
    fetchRatings()
  }, [user, userRole])

  const handleSubmitRating = async () => {
    if (!formData.doctorId || formData.rating === 0) {
      enqueueSnackbar('Please select a doctor and provide a rating', { variant: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const response = await addRatingRequest(formData)
      
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
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return sum / ratings.length
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // for 1-5 stars
    ratings.forEach(rating => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        distribution[rating.rating - 1]++
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
            <Card key={rating.id}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar>
                    {rating.patientName?.[0] || 'P'}
                  </Avatar>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      <Typography variant="subtitle1">
                        {rating.patientName || 'Anonymous Patient'}
                      </Typography>
                      <Rating value={rating.rating} readOnly size="small" />
                      <Chip label={`${rating.rating}/5`} size="small" color="primary" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    {rating.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {rating.comment}
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
            <TextField
              label="Doctor ID"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              fullWidth
              helperText="Enter the ID of the doctor you want to rate"
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