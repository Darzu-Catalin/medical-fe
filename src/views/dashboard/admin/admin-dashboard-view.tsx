'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import exp from 'constants';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clinicId: string;
  specialty: string;
  status: 'Active' | 'Inactive';
  created: string;
  gender: number;
  phoneNumber: string;
  experience: number;
  address: string;
  dateOfBirth: string;
}

interface EditingDoctor {
  id: string;          
  firstName?: string; 
  lastName?: string;
  gender?: number | string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  IDNP?: string;
  clinicId?: string;
  specialty?: number | string;
  experience?: number | string;
}

interface DashboardData {
  totalDoctors: number;
  totalPatients: number;
  activeDoctorsCount: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: 'Active' | 'Inactive';
}

const AdminDashboardView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorPage, setDoctorPage] = useState(1);
  const [patientPage, setPatientPage] = useState(1);
  const pageSize = 10; 
  const [searchTerm, setSearchTerm] = useState('');

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
    { label: 'Nephrology', value: 17 },
    { label: 'Rheumatology', value: 18 },
    { label: 'Other', value: 99 },
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

      console.log(payload);


      const res = await axiosInstance.post('/Admin/CreateDoctor', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Doctor added:', res.data);
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
      // leave optional fields like address or dateOfBirth empty
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

      console.log('Updating doctor with payload:', payload);

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





  // Fetch dashboard stats
  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const token = getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized. No session token found.');

      const res = await axiosInstance.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDashboardData(res.data.data);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setDashboardData(null);
      const status = err?.response?.status;
      if (status === 401) alert('Your session has expired. Please log in again.');
      else if (status === 403) alert('You do not have permission to view this dashboard.');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch doctors
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
      setDoctors(usersData.map((item: any) => ({
        id: item.user.id,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        clinicId: item.user.clinicId || 'N/A',
        specialty: item.user.specialty || 'N/A',
        status: item.user.isActive ? 'Active' : 'Inactive',
        experience: item.user.experience || 'N/A',
        created: '',
      })));
    } catch (err) {
      console.error(err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };


  const fetchPatients = async (page = patientPage) => {
      setLoadingPatients(true);
      try {
        const sessionToken =
          getSession() ||
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token');

        if (!sessionToken) throw new Error('Unauthorized. No session token found.');

        const res = await axiosInstance.get('/Admin/users', {
          headers: { Authorization: `Bearer ${sessionToken}` },
          params: { page, pageSize, role: 'Patient' }, // <--- only role changes
        });

        const usersData = res.data.data || [];
        const mappedPatients = usersData.map((item: any) => ({
          id: item.user.id,
          firstName: item.user.firstName,
          lastName: item.user.lastName,
          email: item.user.email,
          phoneNumber: item.user.phoneNumber,
          status: item.user.isActive ? 'Active' : 'Inactive',
        }));

        setPatients(mappedPatients);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    const toggleUserStatus = async (userId: string, role: 'Doctor' | 'Patient', isActive: boolean) => {
      try {
        const token = getSession() || localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');

        const res = await axiosInstance.post(
          `/Admin/toggle-status/${userId}`, // or pat.id for patients
          {}, // body is empty
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (role === 'Doctor') {
          fetchDoctors(doctorPage);
        } else {
          fetchPatients(patientPage);
        }
      } catch (err) {
        console.error(`Error updating ${role} status:`, err);
        alert('Failed to update status');
      }
    };

    const filteredDoctors = doctors.filter(doc =>
      `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clinicId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPatients = patients.filter(pat =>
      `${pat.firstName} ${pat.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );


  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 0) fetchDoctors();
    if (activeTab === 1) fetchPatients();
  }, [activeTab]);

  const stats = [
    { label: 'Total Doctors', value: dashboardData?.totalDoctors || 0, icon: <GroupOutlinedIcon sx={{ color: '#2563EB', fontSize: 30 }} />, bgColor: '#E0ECFF' },
    { label: 'Active Doctors', value: dashboardData?.activeDoctorsCount || 0, icon: <GroupOutlinedIcon sx={{ color: '#16A34A', fontSize: 30 }} />, bgColor: '#D9FBE5' },
    { label: 'Total Patients', value: dashboardData?.totalPatients || 0, icon: <PersonOutlineIcon sx={{ color: '#9333EA', fontSize: 30 }} />, bgColor: '#F3E8FF' },
    { label: 'To be determined', value: 0, icon: <ShowChartIcon sx={{ color: '#000000', fontSize: 30 }} />, bgColor: '#F5F5F5' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={2} mb={3}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 110 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: stat.bgColor, borderRadius: '50%', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 2 }}>
        <Tab label="Manage Doctors" />
        <Tab label="Manage Patients" />
        {/* <Tab label="System Logs" /> */}
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <GroupOutlinedIcon sx={{ fontSize: 28, color: '#374151', mr: 1 }} /> 
                {/* dark gray color, mr=1 adds a little spacing */}
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

              <Dialog
                open={openAddDoctor}
                onClose={handleCloseAddDoctor}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    p: 2,
                    backgroundColor: '#FAFAFA',
                  },
                }}
              >
                <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: '#111827' }}>
                  Add New Doctor
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        name="firstName"
                        fullWidth
                        value={newDoctor.firstName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        name="lastName"
                        fullWidth
                        value={newDoctor.lastName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Gender"
                        name="gender"
                        fullWidth
                        margin="dense"
                        value={Number(newDoctor.gender)}
                        onChange={handleInputChange}
                        SelectProps={{ native: true }}
                      >
                        <option value="">Select gender</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                        <option value="3">Other</option>
                      </TextField>


                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        name="email"
                        fullWidth
                        value={newDoctor.email}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        fullWidth
                        value={newDoctor.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newDoctor.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Address"
                        name="address"
                        fullWidth
                        value={newDoctor.address}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="IDNP"
                        name="IDNP"
                        fullWidth
                        value={newDoctor.IDNP}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Clinic ID"
                        name="clinicId"
                        fullWidth
                        value={newDoctor.clinicId}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      
                      <TextField
                        select
                        label="Specialty"
                        name="specialty"
                        fullWidth
                        value={Number(newDoctor.specialty)}
                        onChange={handleInputChange}
                        SelectProps={{ native: true }}
                      >
                        <option value="">Select specialty</option>
                        {specialties.map(spec => (
                          <option key={spec.value} value={spec.value}>
                            {spec.label}
                          </option>
                        ))}
                      </TextField>

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Experience (years)"
                        name="experience"
                        type="number"
                        fullWidth
                        value={newDoctor.experience}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                  <Button
                    onClick={handleCloseAddDoctor}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      backgroundColor: '#E5E7EB',
                      color: '#374151',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#D1D5DB' },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddDoctor}
                    sx={{
                      backgroundColor: '#2563EB',
                      '&:hover': { backgroundColor: '#1E40AF' },
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    Add Doctor
                  </Button>
                </DialogActions>
              </Dialog>



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
              <Table
                sx={{
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& th': {
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    color: 'black',
                  },
                  '& td': {
                    py: 0.5, 
                  },
                  '& td, & th': {
                    borderBottom: '1px solid #E5E7EB', // light grey lines between rows
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
                        <Button
                          sx={{
                            textTransform: 'none',
                            backgroundColor: doc.status === 'Active' ? '#FEE2E2' : '#DCFCE7',
                            color: doc.status === 'Active' ? '#DC2626' : '#16A34A',
                            fontWeight: 500,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1.5,
                            '&:hover': {
                              backgroundColor: doc.status === 'Active' ? '#FCA5A5' : '#86EFAC',
                            },
                          }}
                          onClick={() => toggleUserStatus(doc.id, 'Doctor', doc.status === 'Active')}

                        >
                          {doc.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <IconButton onClick={() => handleOpenEditDoctor(doc)}>
                          <Edit />
                        </IconButton>
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
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="First Name"
                                  name="firstName"
                                  fullWidth
                                  value={editingDoctor?.firstName || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Last Name"
                                  name="lastName"
                                  fullWidth
                                  value={editingDoctor?.lastName || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Phone Number"
                                  name="phoneNumber"
                                  fullWidth
                                  value={editingDoctor?.phoneNumber || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Clinic ID"
                                  name="clinicId"
                                  fullWidth
                                  value={editingDoctor?.clinicId || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  select
                                  label="Specialty"
                                  name="specialty"
                                  fullWidth
                                  value={editingDoctor?.specialty ?? ''}
                                  onChange={handleEditInputChange}
                                  SelectProps={{ native: true }}
                                >
                                  <option value="">Select specialty</option>
                                  {specialties.map(spec => (
                                    <option key={spec.value} value={spec.value}>
                                      {spec.label}
                                    </option>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Experience (years)"
                                  name="experience"
                                  type="number"
                                  fullWidth
                                  value={editingDoctor?.experience ?? ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  label="Address"
                                  name="address"
                                  fullWidth
                                  value={editingDoctor?.address || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  label="Date of Birth"
                                  name="dateOfBirth"
                                  type="date"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={editingDoctor?.dateOfBirth || ''}
                                  onChange={handleEditInputChange}
                                />
                              </Grid>
                            </Grid>
                          </DialogContent>
                          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                              <Button
                                onClick={() => editingDoctor?.id && handleDeleteDoctor(editingDoctor.id)}
                                sx={{
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1,
                                  backgroundColor: '#DC2626', // red
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  '&:hover': { backgroundColor: '#B91C1C' },
                                }}
                              >
                                Delete Doctor
                              </Button>

                              <Button
                                onClick={handleCloseEditDoctor}
                                sx={{
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1,
                                  backgroundColor: '#E5E7EB',
                                  color: '#374151',
                                  fontWeight: 600,
                                  '&:hover': { backgroundColor: '#D1D5DB' },
                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                variant="contained"
                                onClick={handleUpdateDoctor}
                                sx={{
                                  backgroundColor: '#2563EB',
                                  '&:hover': { backgroundColor: '#1E40AF' },
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1,
                                  fontWeight: 600,
                                }}
                              >
                                Update Doctor
                              </Button>
                            </DialogActions>

                        </Dialog>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            )}
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

          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <PersonOutlineIcon sx={{ fontSize: 28, color: '#374151', mr: 1 }} /> 
                {/* dark gray color, mr=1 adds a little spacing */}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Patient Management
                </Typography>
              </Box>
              <Button variant="contained">+ Add New Patient</Button>
            </Box>

            <Box mb={2}>
              <TextField
                variant="outlined"
                placeholder="Search patients by name, email, or clinic..."
                fullWidth
                size="small"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>

            {loadingPatients ? (
              <Typography>Loading patients...</Typography>
            ) : (
              <Table
                sx={{
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& th': {
                    backgroundColor: 'white',
                    fontWeight: 'bold',
                    color: 'black',
                  },
                  '& td': {
                    py: 0.5, 
                  },
                  '& td, & th': {
                    borderBottom: '1px solid #E5E7EB', // light grey lines between rows
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((pat) => (
                    <TableRow key={pat.id}>
                      <TableCell>{`${pat.firstName} ${pat.lastName}`}</TableCell>
                      <TableCell>{pat.email}</TableCell>
                      <TableCell>{pat.phoneNumber}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: '9999px',
                            backgroundColor: pat.status === 'Active' ? '#2563EB' : '#E5E7EB',
                            color: pat.status === 'Active' ? '#FFFFFF' : '#6B7280',
                            fontSize: 12,
                            fontWeight: 500,
                            display: 'inline-block',
                            textAlign: 'center'
                          }}
                        >
                          {pat.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          sx={{
                            textTransform: 'none',
                            backgroundColor: pat.status === 'Active' ? '#FEE2E2' : '#DCFCE7',
                            color: pat.status === 'Active' ? '#DC2626' : '#16A34A',
                            fontWeight: 500,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1.5,
                            '&:hover': {
                              backgroundColor: pat.status === 'Active' ? '#FCA5A5' : '#86EFAC',
                            },
                          }}
                          onClick={() => toggleUserStatus(pat.id, 'Patient', pat.status === 'Active')}

                        >
                          {pat.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <IconButton><Edit /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button
              disabled={patientPage === 1}
              onClick={() => {
                setPatientPage(patientPage - 1);
                fetchPatients(patientPage - 1);
              }}
            >
              Previous
            </Button>
            <Button
              disabled={patients.length < pageSize}
              onClick={() => {
                setPatientPage(patientPage + 1);
                fetchPatients(patientPage + 1);
              }}
            >
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* {activeTab === 2 && <Card><CardContent><Typography>System logs will be displayed here.</Typography></CardContent></Card>} */}
    </Box>
  );
};

export default AdminDashboardView;
