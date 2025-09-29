'use client';

import { 
  Box, Typography, Card, Grid, Divider, CardContent, CardHeader, Tabs, Tab, 
  TextField, Button, Avatar, Chip, IconButton, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, Pagination, Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { 
  CalendarToday, SecurityOutlined, WarningAmberOutlined, People, Assignment,
  Search, Visibility, FileDownload, Upload, Delete, Edit, Dashboard,
  Person, Schedule, LocalHospital, Phone, Email, LocationOn
} from '@mui/icons-material';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';




interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  idnp: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  bloodType: string;
}

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingDocuments: number;
  completedVisits: number;
}

const DoctorDashboardView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Patients data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingDocuments: 0,
    completedVisits: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axiosInstance.get('/Doctor/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setDashboardData(res.data);
        console.log('Dashboard Data:', res.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        console.warn('Unauthorized access - token may be expired');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (page: number = 1, pageSize: number = 10) => {
    setPatientsLoading(true);
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) return;

      const res = await axiosInstance.get('/Doctor/my-patients', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, pageSize }
      });

      if (res.data?.data) {
        setPatients(res.data.data);
        setTotalPages(Math.ceil(res.data.total / pageSize));
        
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          totalPatients: res.data.total || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      fetchPatients(currentPage);
      return;
    }

    setPatientsLoading(true);
    try {
      const token = getSession() || localStorage.getItem('token');
      if (!token) return;

      const searchData = {
        name: searchQuery,
        idnp: searchQuery,
        dateOfBirth: null
      };

      const res = await axiosInstance.post('/Doctor/search-my-patients', searchData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setPatients(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (activeTab === 1) { // Patients tab
      fetchPatients(currentPage);
    }
  }, [activeTab, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Doctor Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your patients today.
          </Typography>
        </Box>
        <Chip 
          icon={<LocalHospital />} 
          label="Online" 
          color="success" 
          variant="outlined" 
        />
      </Box>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(_, value) => setActiveTab(value)} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Dashboard />} label="Overview" />
        <Tab icon={<People />} label="My Patients" />
        <Tab icon={<Schedule />} label="Appointments" />
        <Tab icon={<Assignment />} label="Documents" />
        <Tab icon={<Person />} label="Profile" />
      </Tabs>

      {/* Tab Content */}
      <Box>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Patients"
                  value={dashboardStats.totalPatients}
                  icon={<People />}
                  color="#1976d2"
                  subtitle="Active patients under care"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Today's Appointments"
                  value={dashboardStats.appointmentsToday}
                  icon={<Schedule />}
                  color="#2e7d32"
                  subtitle="Scheduled for today"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Documents"
                  value={dashboardStats.pendingDocuments}
                  icon={<Assignment />}
                  color="#ed6c02"
                  subtitle="Awaiting review"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Completed Visits"
                  value={dashboardStats.completedVisits}
                  icon={<LocalHospital />}
                  color="#9c27b0"
                  subtitle="This month"
                />
              </Grid>
            </Grid>

            {/* Quick Actions & Recent Activity */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Quick Actions"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<People />}
                          onClick={() => setActiveTab(1)}
                          sx={{ py: 2 }}
                        >
                          View Patients
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<Schedule />}
                          onClick={() => setActiveTab(2)}
                          sx={{ py: 2 }}
                        >
                          Appointments
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<Assignment />}
                          onClick={() => setActiveTab(3)}
                          sx={{ py: 2 }}
                        >
                          Documents
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<CalendarToday />}
                          sx={{ py: 2 }}
                        >
                          Schedule Visit
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Recent Activity"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    {dashboardData?.recentActivity ? (
                      <Box display="flex" flexDirection="column" gap={2}>
                        {dashboardData.recentActivity.slice(0, 4).map((activity: any, index: number) => (
                          <Box key={index} display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <Person fontSize="small" />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight="medium">
                                {activity.description || `Patient visit completed`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.date ? new Date(activity.date).toLocaleDateString() : 'Today'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" textAlign="center" py={2}>
                        No recent activity
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Patients Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Search and Controls */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    My Patients ({dashboardStats.totalPatients})
                  </Typography>
                  <Button variant="contained" startIcon={<Person />}>
                    Add Patient
                  </Button>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    placeholder="Search patients by name or IDNP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={searchPatients}
                    disabled={patientsLoading}
                  >
                    Search
                  </Button>
                  <Button 
                    variant="text" 
                    onClick={() => {
                      setSearchQuery('');
                      fetchPatients(1);
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Patients Table */}
            <Card>
              <CardContent>
                {patientsLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : patients.length > 0 ? (
                  <>
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>IDNP</TableCell>
                            <TableCell>Date of Birth</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Blood Type</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {patients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                      {patient.firstName} {patient.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      ID: {patient.id.substring(0, 8)}...
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{patient.idnp || 'N/A'}</TableCell>
                              <TableCell>
                                {patient.dateOfBirth 
                                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                                  : 'N/A'
                                }
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                                    <Phone fontSize="small" />
                                    {patient.phoneNumber || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" display="flex" alignItems="center" gap={1} color="text.secondary">
                                    <Email fontSize="small" />
                                    {patient.email || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={patient.bloodType || 'Unknown'} 
                                  color="primary" 
                                  variant="outlined" 
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box display="flex" gap={1}>
                                  <IconButton size="small" color="primary">
                                    <Visibility />
                                  </IconButton>
                                  <IconButton size="small" color="secondary">
                                    <Edit />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box display="flex" justifyContent="center" mt={3}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No patients found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first patient'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Appointments Tab */}
        {activeTab === 2 && (
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>
                    Doctor’s Appointments
                    </Typography>
                </Box>
                console.log('Appointments Tab - dashboardData:', dashboardData);
                <Typography variant="body2" color="text.secondary" fontSize="1.1rem" gutterBottom>
                    Overview of your scheduled appointments
                </Typography>

                {dashboardData.appointments && dashboardData.appointments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dashboardData.appointments.map((appt: any, index: number) => (
                        <Card key={index} sx={{ p: 2, border: "1px solid #b1b1b1", borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                            {new Date(appt.date).toLocaleDateString()} at {appt.time}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} fontSize="1.1rem" color="primary">
                            Patient: {appt.patientName}
                            </Typography>
                        </Box>
                        <Typography variant="body2" fontSize="1rem" color="text.secondary">
                            Reason: {appt.reason || "N/A"}
                        </Typography>
                        <Typography variant="body2" fontSize="1rem" color="text.secondary">
                            Status: {appt.status || "Scheduled"}
                        </Typography>
                        </Card>
                    ))}
                    </Box>
                ) : (
                    <Typography color="text.secondary">No appointments scheduled.</Typography>
                )}
                </CardContent>
            </Card>
        )}

        {/* Appointments Tab */}
        {activeTab === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Appointments are managed through the calendar system. Visit the Calendar page to view and manage your appointments.
            </Alert>
            
            <Card>
              <CardHeader 
                title="Appointment Management"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box textAlign="center" p={3}>
                      <Schedule sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        View Calendar
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Access your complete appointment schedule
                      </Typography>
                      <Button variant="contained" startIcon={<CalendarToday />}>
                        Go to Calendar
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box textAlign="center" p={3}>
                      <Assignment sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Schedule Appointment
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Book new appointments with patients
                      </Typography>
                      <Button variant="outlined" startIcon={<Schedule />}>
                        Schedule New
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Documents Tab */}
        {activeTab === 3 && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Patient Documents"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center" p={3}>
                      <Upload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Document
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Upload medical documents for patients
                      </Typography>
                      <Button variant="contained" startIcon={<Upload />}>
                        Upload File
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center" p={3}>
                      <FileDownload sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        View Documents
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Access patient medical documents
                      </Typography>
                      <Button variant="outlined" startIcon={<Visibility />}>
                        Browse Files
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center" p={3}>
                      <Delete sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Manage Documents
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Edit or delete existing documents
                      </Typography>
                      <Button variant="outlined" color="error" startIcon={<Edit />}>
                        Manage
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Profile Tab */}
        {activeTab === 4 && (
          <Card>
            <CardHeader 
              title="Doctor Profile"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              {dashboardData?.profile ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Full Name:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.firstName} {dashboardData.profile.lastName}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Email:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.email || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Phone:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.phoneNumber || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Specialty:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.specialty || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Typography variant="h6" gutterBottom>
                        Professional Details
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">License Number:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.licenseNumber || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Years of Experience:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.experience || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Hospital/Clinic:</Typography>
                        <Typography fontWeight="medium">
                          {dashboardData.profile.workplace || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Profile information not available
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default DoctorDashboardView;
