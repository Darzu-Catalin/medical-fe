'use client';

import { Box, Typography, Grid, Card, CardContent, Button, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import type { AxiosError } from 'axios';

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

const BookAppointments = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [allDoctors, setAllDoctors] = useState<any[]>([]); // Store all doctors
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]); // Store filtered doctors
  const [appointments, setAppointments] = useState<any[]>([]); // Store appointments
  const [openModal, setOpenModal] = useState(false); // Modal visibility state
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null); // Selected doctor details
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

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
    } catch (err) {
      if ((err as AxiosError).response?.status === 404) {
        console.error('Endpoint not found:', err);
        alert('The requested resource was not found.');
      } else {
        console.error('Error fetching doctors and specialties:', err);
      }
    }
  };

  const fetchAppointments = async (page = 1, pageSize = 20) => {
    try {
      const res = await axiosInstance.get('/appointment/my', {
        headers: { Authorization: `Bearer ${getSession() || localStorage.getItem('token')}` },
        params: { page, pageSize },
      });

      console.log('Fetched Appointments Response:', res.data); // Log the entire response

      // Extract appointments from the correct key in the response
      const appointments = res.data?.data || []; // Adjust based on actual structure
      setAppointments(appointments);
      console.log('Appointments:', appointments); // Log the extracted appointments
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
      handleCloseModal();
      fetchAppointments(); // Refresh appointments
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch and log user data on component mount
    fetchDoctorsAndSpecialties();
    fetchAppointments();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Book an Appointment
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Specialty</InputLabel>
        <Select value={selectedSpecialty || ''} onChange={handleSpecialtyChange}>
          {specialties.map((specialty, index) => (
            <MenuItem key={index} value={specialty}>
              {specialty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSpecialty && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {filteredDoctors.map((doctor, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {doctor.firstName} {doctor.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Specialty: {doctor.specialty}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenModal(doctor)}
                    sx={{ mt: 2 }}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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

      <Typography variant="h6" gutterBottom>
        Your Appointments
      </Typography>
      {appointments.length > 0 ? (
        <Grid container spacing={2}>
          {appointments.map((appointment, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="body1">
                    <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Doctor:</strong> {appointment.doctorName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status:</strong> {appointment.status}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Reason:</strong> {appointment.reason}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {appointment.notes || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">No appointments found.</Typography>
      )}
    </Box>
  );
};

export default BookAppointments;
