'use client';

import { Box, Typography, Grid, Card, CardContent, Button, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import type { AxiosError } from 'axios';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';


const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]; // Extract the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace URL-safe characters
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload); // Parse the JSON payload
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
};

// Mapping for AppointmentStatus enum
const appointmentStatusMap: { [key: number]: string } = {
  1: 'Scheduled',
  2: 'Confirmed',
  3: 'In Progress',
  4: 'Completed',
  5: 'Cancelled',
  6: 'No Show',
};

const BookAppointments = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [allDoctors, setAllDoctors] = useState<any[]>([]); // Store all doctors
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]); // Store filtered doctors
  const [doctorRatings, setDoctorRatings] = useState<{ [key: string]: number }>({}); // doctorId -> average rating
  const [appointments, setAppointments] = useState<any[]>([]); // Store appointments
  const [openModal, setOpenModal] = useState(false); // Modal visibility state
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null); // Selected doctor details
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  const [openCancelModal, setOpenCancelModal] = useState(false); // Cancel modal visibility state]
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);


  const fetchUserData = () => {
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) {
        console.error('No token found.');
        return;
      }

      const decodedToken: any = decodeToken(token); // Decode the JWT token
      console.log('Decoded User Data:', decodedToken); // Print the decoded token to the console

      // Extract user ID using bracket notation
      const userId = decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      console.log('User ID:', userId); // Print the user ID
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  };

  const fetchDoctorsAndSpecialties = async () => {
    try {
      const res = await axiosInstance.get('/Doctor', {
        headers: { Authorization: `Bearer ${getSession() || localStorage.getItem('token')}` },
      });
      const data = res.data;

      console.log('Fetched Doctors:', data);

      setAllDoctors(data); // Store all doctors
      setFilteredDoctors(data); // Initially, show all doctors

      const specialties = Array.from(new Set(data.map((doctor: any) => doctor.specialty).filter(Boolean))) as string[];
      setSpecialties(specialties);
      console.log('Extracted Specialties:', specialties);

      // Fetch ratings for each doctor
      const ratingsMap: { [key: string]: number } = {};
      await Promise.all(data.map(async (doctor: any) => {
        const ratingData = await fetchDoctorRating(doctor.id);
        ratingsMap[doctor.id] = ratingData.AverageRating;
      }));

      setDoctorRatings(ratingsMap);
      console.log('Doctor Ratings Map:', ratingsMap);

    } catch (err) {
      if ((err as AxiosError).response?.status === 404) {
        console.error('Endpoint not found:', err);
        alert('The requested resource was not found.');
      } else {
        console.error('Error fetching doctors and specialties:', err);
      }
    }
  };

  const fetchDoctorRating = async (doctorId: number) => {
    try {
      const res = await axiosInstance.get(`/ratings/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${getSession() || localStorage.getItem('token')}` },
      });
      return res.data;
    }
    catch(err){
      console.error('Error fetching doctor rating:', err);
      return { AverageRating: 0, RatingsCount: 0 };

    }};

  const fetchAppointments = async (page = 1, pageSize = 20) => {
    try {
      const res = await axiosInstance.get('/appointment/my', {
        headers: { Authorization: `Bearer ${getSession() || localStorage.getItem('token')}` },
        params: { page, pageSize },
      });

      console.log('Fetched Appointments Response:', res.data); // Log the entire response

      // Extract appointments from the correct key in the response
      const appointments = res.data?.data || []; // Adjust based on actual structure

      // Sort appointments by date (earliest to farthest)
      const sortedAppointments = appointments.sort(
        (a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );

      setAppointments(sortedAppointments);
      console.log('Sorted Appointments:', sortedAppointments); // Log the sorted appointments
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]); // Set an empty array if an error occurs
    }
  };

  const handleSpecialtyChange = (event: any) => {
    const specialty = event.target.value;
    console.log('Selected Specialty:', specialty);
    setSelectedSpecialty(specialty);

    // Filter doctors by selected specialty from the full list of doctors
    const filtered = allDoctors.filter((doctor: any) => doctor.specialty === specialty);
    setFilteredDoctors(filtered);
  };

  const handleOpenModal = (doctor: any) => {
    setSelectedDoctor(doctor);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDoctor(null);
    setFormData({ date: '', time: '', reason: '', notes: '' });
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAppointment = async () => {
    try {
      // Combine date and time into a single Date object
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);

      // Check if the selected date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison
      if (appointmentDate < today) {
        alert('The selected date cannot be in the past. Please choose a valid date.');
        return;
      }

      // Decode the JWT token to extract the userId
      const token = getSession() || localStorage.getItem('token');
      if (!token) {
        alert('User is not authenticated.');
        return;
      }

      const decodedToken = decodeToken(token); // Decode the JWT token
      console.log('Decoded Token:', decodedToken); // Debugging log

      // Extract the user ID from the correct key using bracket notation
      const patientId =
        decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        localStorage.getItem('userId'); // Fallback to localStorage if needed

      if (!patientId) {
        alert('Failed to retrieve patient ID. Please log in again.');
        return;
      }

      console.log('Patient ID:', patientId); // Debugging log

      const payload = {
        patientId, // Use the extracted patientId
        doctorId: selectedDoctor.id,
        appointmentDate: appointmentDate.toISOString(),
        duration: 30, // Default duration in minutes
        reason: formData.reason,
        notes: formData.notes,
      };

      console.log('Submitting Appointment:', payload);

      const res = await axiosInstance.post('/appointment', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Appointment booked successfully:', res.data);
      alert('Appointment booked successfully!');

      // Reset the selected specialty and doctors list
      setSelectedSpecialty(null);
      setFilteredDoctors([]);

      handleCloseModal();
      fetchAppointments(); // Refresh appointments
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleOpenCancelModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!appointmentId) return;
    try {
      console.log('Cancelling appointment with id:', appointmentId);

      const token = getSession() || localStorage.getItem('token');
      if (!token) {
        alert('User is not authenticated.');
        return;
      }

      const decodedToken = decodeToken(token); // Decode the JWT token
      console.log('Decoded Token:', decodedToken); // Debugging log

      await axiosInstance.delete(`/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAppointments();
      handleCloseCancelModal();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }

  };

  useEffect(() => {
    fetchUserData(); // Fetch and log user data on component mount
    fetchDoctorsAndSpecialties();
    fetchAppointments();
  }, []);

  return (
     <Box >
      <Card sx={{ p: 5, mb:4, boxShadow: 'none',  border: '1px solid #e0e0e0' }}>

      <Box sx={{ mb: 3 }}>
        <Box display="flex">
          <EditCalendarIcon sx={{ color: '#1e40af' , mr:1}} />
          <Typography  variant="h6" gutterBottom>
            Book an Appointment
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom fontSize="1.1rem">
        Select a medical specialty and choose from available doctors
        </Typography>
      </Box>

      <Typography variant="body2"  gutterBottom fontWeight="bold">
      Select Medical Specialty      
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel
          id="specialty-label"
          shrink={false}
          sx={{
            color: selectedSpecialty ? 'inherit' : 'text.secondary',
            '&.Mui-focused': {
              color: 'inherit', // Prevent color change on focus
            },
          }}
        >
          {selectedSpecialty || 'Choose a specialty...'}
        </InputLabel>
        <Select
          labelId="specialty-label"
          id="specialty-select"
          value={selectedSpecialty || ''}
          onChange={handleSpecialtyChange}
          displayEmpty
          sx={{
            backgroundColor: '#f5f5f5',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none', // Remove border
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none', // Prevent border emphasis on focus
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none', // Prevent border emphasis on hover
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                padding: 1,
                backdropFilter: 'none',
                bgcolor: '#ffffff',
                backgroundImage: 'none',
              },
            },
            MenuListProps: {
              sx: {
                padding: 0,
              },
            },
          }}
        >
          {specialties.map((specialty, index) => (
            <MenuItem
              key={index}
              value={specialty}
              sx={{
                backgroundColor: '#ffffff',
                margin: '4px 0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#29A644', color: '#ffffff' },
                '&.Mui-selected': { backgroundColor: '#29A644', color: '#ffffff' },
                '&.Mui-selected:hover': { backgroundColor: '#29A644', color: '#ffffff' },
              }}
            >
              {specialty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedSpecialty && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <EditCalendarIcon sx={{ fontSize: 60, color: '#f5f5f5', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" fontSize="1.1rem">
            Select a specialty to view available doctors
          </Typography>
        </Box>
      )}

      {selectedSpecialty && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Available Doctors
          </Typography>
          <Grid container spacing={2}>
            {filteredDoctors.map((doctor, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Add shadow to the card
                    p: 2,
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for hover effect
                    '&:hover': {
                      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)', // Increase shadow on hover
                    },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Left Column: Doctor Info */}
                      <Grid item xs={9}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              backgroundColor: '#e0f7fa',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                          <PersonIcon sx={{ color: '#00796b', fontSize: 30 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                <span style={{ color: '#fbc02d' }}>★</span> {doctorRatings[doctor.id]?.toFixed(1) || 'No ratings yet'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {doctor.experience || 'N/A'} years experience
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <span style={{ color: '#757575' }}>📍</span> {doctor.address || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {doctor.description || 'No description available.'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Next available: <strong>{doctor.nextAvailableDate || 'N/A'}</strong>
                        </Typography>
                        <Box display="flex" gap={1} sx={{ mt: 1 }}>
                          {doctor.availableTimes?.map((time: string, idx: number) => (
                            <Box
                              key={idx}
                              sx={{
                                backgroundColor: '#e0f7fa',
                                color: '#00796b',
                                padding: '4px 12px',
                                borderRadius: '16px',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            >
                              {time}
                            </Box>
                          ))}
                        </Box>
                      </Grid>

                      {/* Right Column: Book Button */}
                      <Grid item xs={3} display="flex" justifyContent="flex-end" alignItems="flex-start">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenModal(doctor)}
                          sx={{
                            backgroundColor: '#0041D4',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 'bold',
                          }}
                        >
                          Book Appointment
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Modal for Booking Appointment */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Book Appointment with {selectedDoctor?.firstName} {selectedDoctor?.lastName}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Reason for Visit"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Additional Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitAppointment} variant="contained" color="primary">
            Confirm Appointment
          </Button>
        </DialogActions>
      </Dialog>
      </Card>

      <Card sx={{ p: 5, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Box sx={{ mb: 3 }}>
          <Box display="flex">
            <CalendarTodayIcon sx={{ color: '#29A644', mr: 1 }} />
            <Typography variant="h6" gutterBottom>
              My Appointments
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom fontSize="1.1rem">
            My scheduled and past appointments
          </Typography>
        </Box>

        {appointments.length > 0 ? (
          <Grid container spacing={2}>
            {appointments.map((appointment, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    boxShadow: 'none', // Remove box shadow
                  }}
                >
                  <CardContent>
                    <Grid container alignItems="center">
                      {/* Left Column: Appointment Details */}
                      <Grid item xs={9}>
                        <Typography variant="h6" fontWeight="bold">
                          Dr. {appointment.doctorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.specialty || "N/A"}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: '#757575' }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <QueryBuilderIcon sx={{ fontSize: 16, color: '#757575' }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true, // Ensures the time is displayed in 12-hour format with AM/PM
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right Column: Appointment Status */}
                      <Grid item xs={3} display="flex" justifyContent="flex-end" alignItems="center">
                        <Box display={"flex"} alignItems="center" gap={1}>
                          <Box
                            sx={{
                              backgroundColor:
                                appointment.status === 1
                                  ? '#e0f7fa'
                                  : appointment.status === 4
                                  ? '#e8f5e9'
                                  : appointment.status === 5
                                  ? '#ffebee'
                                  : '#e0e0e0',
                              color:
                                appointment.status === 1
                                  ? '#00796b'
                                  : appointment.status === 4
                                  ? '#388e3c'
                                  : appointment.status === 5
                                  ? '#d32f2f'
                                  : '#757575',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              textAlign: 'center',
                            }}
                          >
                            {appointmentStatusMap[appointment.status] || 'Unknown'}
                          </Box>

                          {/* Cancel Button (only when status === 1) */}
                          {appointment.status === 1 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleOpenCancelModal(appointment)}
                              sx={{
                                fontSize: '1.3rem',
                                width: '1.5rem',
                                borderRadius: '16px',
                               
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.1)', // light red background on hover
                                },
                                '&:active': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.2)', // slightly darker on click
                                },
                              }}
                            >
                              <ClearIcon fontSize="inherit" />
                            </Button>)}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No appointments found.</Typography>
        )}

      {/* Modal for Cancelling Appointment */}
      <Dialog  open={openCancelModal} onClose={handleCloseCancelModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Cancel Appointment</DialogTitle>
          <DialogContent>
            <Typography align="center">
              Are you sure you want to cancel your appointment with{' '}
              {selectedAppointment?.doctorName} on{' '}
              {selectedAppointment &&
                new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
              ?
              <br />
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button
              onClick={() => handleCancelAppointment(selectedAppointment?.id)}
              variant="contained"
              color="error"
              >
              Yes, cancel
            </Button>
            <Button onClick={handleCloseCancelModal}>
              Keep Appointment
            </Button>
            </DialogActions>
           </Dialog>            


      </Card>
    </Box>
  );
};

export default BookAppointments;
