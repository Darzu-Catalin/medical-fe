'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import DoctorProfileCard from '@/views/dashboard/admin/tabs/DoctorProfile';
import axios from 'axios';

// Interfaces and Hooks from admin-dashboard-view.tsx

export interface DoctorRatingsSummaryDto {
  doctorId: string;
  averageRating: number;
  ratingsCount: number;
  ratings: Rating[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  duration: number;
  status: number;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export const useDoctorAppointments = (doctorId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized. No session token found.');

        const res = await axios.get<{ data: Appointment[] }>(`http://localhost:5152/api/Admin/${doctorId}/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.data); // must be an array

      } catch (err: any) {
        setError(err.message || 'Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  return { appointments, loading, error };
};

export const useDoctorRatings = (doctorId: string) => {
  const [ratingsSummary, setRatingsSummary] = useState<DoctorRatingsSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    const fetchRatings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const res = await axios.get<DoctorRatingsSummaryDto>(
          `http://localhost:5152/api/Admin/${doctorId}/ratings-summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRatingsSummary(res.data);
      } catch (err: any) {
        setError(err.message || 'Error fetching ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [doctorId]);

  return { ratingsSummary, loading, error };
};

const getDoctorPatientCount = async (doctorId: string) => {
    const token = getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return 0;
  
    const res = await axios.get(`http://localhost:5152/api/Admin/${doctorId}/patient-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    return res.data.totalPatients;
  };

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  clinicId: string;
  experience: number;
  email: string;
  phoneNumber: string;
  status: 'Active' | 'Inactive';
  totalPatients?: number;
  completedAppointments?: number;
  todaysAppointments?: number;
  avatarUrl?: string;
  address?: string; // New field
  dateOfBirth: string; // New field
  IDNP: string; // New field
  bloodType?: string;
  gender: number;
}

export interface Rating {
  id: string;
  patientName: string;
  ratingValue: number;
  comment: string;
  date: string;
}

export default function ProviderListView() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorPage, setDoctorPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');

  // viewing docs
  const [openDoctorProfile, setOpenDoctorProfile] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useDoctorAppointments(selectedDoctor?.id || '');
  const { ratingsSummary, loading, error } = useDoctorRatings(selectedDoctor?.id || '');
  const [totalPatientCount, setTotalPatientCount] = useState<number>(0);

  useEffect(() => {
    const fetchPatientCount = async () => {
      const count = await getDoctorPatientCount(selectedDoctor?.id || '');
      setTotalPatientCount(Number(count));
    };

    if (selectedDoctor) {
        fetchPatientCount();
    }
  }, [selectedDoctor]);

  // adding new doctors
  const [openAddDoctor, setOpenAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    IDNP: '',
    clinicId: '',
    specialty: '',
    experience: ''
  });

  const specialties = [
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
  ];

  const handleOpenAddDoctor = () => setOpenAddDoctor(true);
  const handleCloseAddDoctor = () => setOpenAddDoctor(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: name === 'gender' || name === 'specialty' ? Number(value) : value
    }));
  };

  const handleAddDoctor = async () => {
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const payload = {
        ...newDoctor,
        dateOfBirth: new Date(newDoctor.dateOfBirth).toISOString(),
        experience: newDoctor.experience
      };

      await axiosInstance.post('/Admin/CreateDoctor', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      handleCloseAddDoctor();
      fetchDoctors(); // refresh list
    } catch (err: any) {
      console.error('Failed to add doctor:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to add doctor');
    }
  };

  // editing existing doctors
  const [openEditDoctor, setOpenEditDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor & { dateOfBirth?: string }> | null>(null);

  const handleOpenEditDoctor = (doctor: Doctor) => {
    setEditingDoctor({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      phoneNumber: doctor.phoneNumber,
      clinicId: doctor.clinicId,
      specialty: doctor.specialty,
      experience: doctor.experience,
      address: doctor.address,
      email: doctor.email,
      dateOfBirth: doctor.dateOfBirth
    });
    setOpenEditDoctor(true);
  };

  const handleCloseEditDoctor = () => {
    setOpenEditDoctor(false);
    setEditingDoctor(null);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!editingDoctor) return;

    setEditingDoctor(prev => ({
      ...prev,
      [name]: name === 'specialty' || name === 'gender' ? Number(value) : value
    }));
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor || !editingDoctor.id) return;

    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      // Find the original doctor
      const originalDoctor = doctors.find(d => d.id === editingDoctor.id);
      if (!originalDoctor) throw new Error('Original doctor not found');

      // Build payload only with changed fields
      const payload: any = {};

      if (editingDoctor.firstName && editingDoctor.firstName !== originalDoctor.firstName)
        payload.firstName = editingDoctor.firstName;

      if (editingDoctor.lastName && editingDoctor.lastName !== originalDoctor.lastName)
        payload.lastName = editingDoctor.lastName;

      if (editingDoctor.phoneNumber && editingDoctor.phoneNumber !== originalDoctor.phoneNumber)
        payload.phoneNumber = editingDoctor.phoneNumber;

      if (editingDoctor.address && editingDoctor.address !== originalDoctor.address)
        payload.address = editingDoctor.address;

      if (editingDoctor.clinicId && editingDoctor.clinicId !== originalDoctor.clinicId)
        payload.clinicId = editingDoctor.clinicId;
      
      if (editingDoctor.email && editingDoctor.email !== originalDoctor.email)
        payload.email = editingDoctor.email;

      if (
        editingDoctor.specialty !== undefined &&
        editingDoctor.specialty !== '' &&
        editingDoctor.specialty !== originalDoctor.specialty
      )
        payload.specialty = editingDoctor.specialty;

      if (
        editingDoctor.experience !== undefined &&
        editingDoctor.experience !== originalDoctor.experience
      )
        payload.experience = String(editingDoctor.experience);

    if (
        editingDoctor.dateOfBirth &&
        editingDoctor.dateOfBirth !== originalDoctor.dateOfBirth
    )
        payload.dateOfBirth = new Date(editingDoctor.dateOfBirth).toISOString();


      if (Object.keys(payload).length === 0) {
        alert('No changes to update.');
        return;
      }

      await axiosInstance.put(`/Admin/updateDoctor/${editingDoctor.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Doctor updated successfully');
      handleCloseEditDoctor();
      fetchDoctors(); // refresh the list
    } catch (err: any) {
      console.error('Failed to update doctor:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axiosInstance.delete(`/Admin/deleteDoctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Doctor deleted successfully');
      handleCloseEditDoctor();
      fetchDoctors(); // refresh the list
    } catch (err: any) {
      console.error('Failed to delete doctor:', err.response?.data || err.message);
      alert(err.response?.data?.title || 'Failed to delete doctor');
    }
  };

  const fetchDoctors = async (page = doctorPage) => {
    setLoadingDoctors(true);
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const res = await axiosInstance.get('/Admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, pageSize, role: 'Doctor' },
      });

      const usersData = res.data.data || [];
      // The backend returns user object inside. Map it to Doctor interface
      setDoctors(usersData.map((item: any) => ({
        id: item.user.id,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        clinicId: item.user.clinicId || 'N/A',
        specialty: item.user.specialty || 'N/A',
        status: item.user.isActive ? 'Active' : 'Inactive',
        // Some users might have role Patient too? admin can have any
        experience: item.user.experience || 'N/A',
        idnp: item.user.idnp || 'N/A',
        created: item.user.created || 'N/A',
        address: item.user.address || 'N/A',
        dateOfBirth: item.user.dateOfBirth || 'N/A',
        phoneNumber: item.user.phoneNumber || 'N/A',
        gender: item.user.gender || 'N/A',
      })));
    } catch (err) {
      console.error(err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const toggleUserStatus = async (userId: string, role: 'Doctor' | 'Patient', isActive: boolean) => {
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axiosInstance.post(
        `/Admin/toggle-status/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchDoctors(doctorPage);
    } catch (err) {
      console.error(`Error updating ${role} status:`, err);
      alert('Failed to update status');
    }
  };

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setOpenDoctorProfile(true);
  };

  useEffect(() => {
    fetchDoctors();
  }, [doctorPage]);

  const filteredDoctors = doctors.filter(doc =>
    `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clinicId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Doctor Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenAddDoctor}
            sx={{
              backgroundColor: '#2563EB',
              '&:hover': { backgroundColor: '#1E40AF' },
            }}
          >
            + Add New Doctor
          </Button>
        </Box>

        <Box mb={2}>
          <TextField
            variant="outlined"
            placeholder="Search doctors by name, email, or clinic..."
            fullWidth
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {loadingDoctors ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : doctors.length === 0 ? (
          <Typography>No doctors found.</Typography>
        ) : (
          <>
            <Table
              sx={{
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& th': {
                  backgroundColor: 'background.primary',
                  fontWeight: 'bold',
                  color: 'primary',
                },
                '& td': {
                  py: 0.5,
                },
                '& td, & th': {
                  borderBottom: '', // Remove bottom border for cleaner look
                },
              }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Clinic</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDoctors.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{`Dr. ${doc.firstName} ${doc.lastName}`}</TableCell>
                    <TableCell>{doc.email}</TableCell>
                    <TableCell>{doc.clinicId}</TableCell>
                    <TableCell>{doc.specialty}</TableCell>
                    <TableCell>
                      {doc.experience && String(doc.experience) !== 'N/A' ? `${doc.experience} ${doc.experience === 1 ? 'year' : 'years'}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: '9999px',
                          backgroundColor: doc.status === 'Active' ? '#2563EB' : '#E5E7EB',
                          color: doc.status === 'Active' ? '#FFFFFF' : '#6B7280',
                          fontSize: 12,
                          fontWeight: 500,
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                      >
                        {doc.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewProfile(doc)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            '&:hover': { borderColor: '#1E40AF', backgroundColor: '#EFF6FF' }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenEditDoctor(doc)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#10B981',
                            color: '#10B981',
                            '&:hover': { borderColor: '#059669', backgroundColor: '#ECFDF5' }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleUserStatus(doc.id, 'Doctor', doc.status === 'Active')}
                          sx={{
                            textTransform: 'none',
                            borderColor: doc.status === 'Active' ? '#F59E0B' : '#10B981',
                            color: doc.status === 'Active' ? '#F59E0B' : '#10B981',
                            '&:hover': {
                              borderColor: doc.status === 'Active' ? '#D97706' : '#059669',
                              backgroundColor: doc.status === 'Active' ? '#FEF3C7' : '#ECFDF5'
                            }
                          }}
                        >
                          {doc.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDeleteDoctor(doc.id)}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            '&:hover': { borderColor: '#DC2626', backgroundColor: '#FEE2E2' }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box mt={2}>
              <Button
                  disabled={doctorPage === 1}
                  onClick={() => {
                  setDoctorPage(doctorPage - 1);
                  fetchDoctors(doctorPage - 1);
                  }}
              >
                  Previous
              </Button>
              <Button
                  disabled={doctors.length < pageSize}
                  onClick={() => {
                  setDoctorPage(doctorPage + 1);
                  fetchDoctors(doctorPage + 1);
                  }}
              >
                  Next
              </Button>
            </Box>
          </>
        )}

        {/* Dialogs */}
        <Dialog
          open={openAddDoctor}
          onClose={handleCloseAddDoctor}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 3, p: 2, backgroundColor: '#FAFAFA' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: '#111827' }}>
            Add New Doctor
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              {/* Form Fields */}
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" name="firstName" fullWidth value={newDoctor.firstName} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" name="lastName" fullWidth value={newDoctor.lastName} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Gender" name="gender" fullWidth margin="dense" value={Number(newDoctor.gender)} onChange={handleInputChange} SelectProps={{ native: true }}>
                  <option value="">Select gender</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" name="email" fullWidth value={newDoctor.email} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phoneNumber" fullWidth value={newDoctor.phoneNumber} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Birth" name="dateOfBirth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newDoctor.dateOfBirth} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" name="address" fullWidth value={newDoctor.address} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="IDNP" name="IDNP" fullWidth value={newDoctor.IDNP} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Clinic ID" name="clinicId" fullWidth value={newDoctor.clinicId} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Specialty" name="specialty" fullWidth value={Number(newDoctor.specialty)} onChange={handleInputChange} SelectProps={{ native: true }}>
                  <option value="">Select specialty</option>
                  {specialties.map(spec => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Experience (years)" name="experience" type="number" fullWidth value={newDoctor.experience} onChange={handleInputChange} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={handleCloseAddDoctor} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#E5E7EB', color: '#374151', fontWeight: 600, '&:hover': { backgroundColor: '#D1D5DB' } }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddDoctor} sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1E40AF' }, borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}>
              Add Doctor
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openEditDoctor}
          onClose={handleCloseEditDoctor}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3, p: 2, backgroundColor: '#FAFAFA' } }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>Edit Doctor</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              {/* Edit Form */}
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" name="firstName" fullWidth value={editingDoctor?.firstName || ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" name="lastName" fullWidth value={editingDoctor?.lastName || ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phoneNumber" fullWidth value={editingDoctor?.phoneNumber || ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" name="email" fullWidth value={editingDoctor?.email || ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Specialty" name="specialty" fullWidth value={editingDoctor?.specialty ?? ''} onChange={handleEditInputChange} SelectProps={{ native: true }}>
                  <option value="">Select specialty</option>
                  {specialties.map(spec => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Experience (years)" name="experience" type="number" fullWidth value={editingDoctor?.experience ?? ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" name="address" fullWidth value={editingDoctor?.address || ''} onChange={handleEditInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Clinic" name="clinicId" fullWidth InputLabelProps={{ shrink: true }} value={editingDoctor?.clinicId || ''} onChange={handleEditInputChange} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={() => editingDoctor?.id && handleDeleteDoctor(editingDoctor.id)} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 600, '&:hover': { backgroundColor: '#B91C1C' } }}>
              Delete Doctor
            </Button>
            <Button onClick={handleCloseEditDoctor} sx={{ borderRadius: 2, px: 3, py: 1, backgroundColor: '#E5E7EB', color: '#374151', fontWeight: 600, '&:hover': { backgroundColor: '#D1D5DB' } }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleUpdateDoctor} sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1E40AF' }, borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}>
              Update Doctor
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDoctorProfile}
          onClose={() => setOpenDoctorProfile(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            {selectedDoctor && (
              <DoctorProfileCard
                doctor={{
                  id: selectedDoctor.id,
                  firstName: selectedDoctor.firstName,
                  lastName: selectedDoctor.lastName,
                  specialty: selectedDoctor.specialty,
                  clinicId: selectedDoctor.clinicId || 'N/A',
                  experience: selectedDoctor.experience || 0,
                  email: selectedDoctor.email,
                  phoneNumber: selectedDoctor.phoneNumber,
                  status: selectedDoctor.status,
                  totalPatients: totalPatientCount || 0,
                  completedAppointments: 2834,
                  todaysAppointments: 0,
                  address: selectedDoctor.address || 'N/A',
                  dateOfBirth: selectedDoctor.dateOfBirth,
                  IDNP: selectedDoctor.IDNP,
                  bloodType: selectedDoctor.bloodType || 'N/A',
                  gender: selectedDoctor.gender,
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
