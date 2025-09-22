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
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clinic: string;
  specialization: string;
  status: 'Active' | 'Inactive';
  created: string;
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
        clinic: '',
        specialization: '',
        status: item.user.isActive ? 'Active' : 'Inactive',
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
        <Tab label="System Logs" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Doctor Management</Typography>
              <Button variant="contained">+ Add New Doctor</Button>
            </Box>

            {loadingDoctors ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : doctors.length === 0 ? (
              <Typography>No doctors found.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Clinic</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doctors.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{`${doc.firstName} ${doc.lastName}`}</TableCell>
                      <TableCell>{doc.email}</TableCell>
                      <TableCell>{doc.clinic}</TableCell>
                      <TableCell>{doc.specialization}</TableCell>
                      <TableCell>{doc.status}</TableCell>
                      <TableCell>{doc.created || '-'}</TableCell>
                      <TableCell>
                        {doc.status === 'Active' ? (
                          <Button size="small" color="error">Deactivate</Button>
                        ) : (
                          <Button size="small" color="success">Activate</Button>
                        )}
                        <IconButton><Edit /></IconButton>
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
              <Typography variant="h6">Patient Management</Typography>
              <Button variant="contained">+ Add New Patient</Button>
            </Box>

            {loadingPatients ? (
              <Typography>Loading patients...</Typography>
            ) : (
              <Table>
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
                  {patients.map((pat) => (
                    <TableRow key={pat.id}>
                      <TableCell>{`${pat.firstName} ${pat.lastName}`}</TableCell>
                      <TableCell>{pat.email}</TableCell>
                      <TableCell>{pat.phoneNumber}</TableCell>
                      <TableCell>{pat.status}</TableCell>
                      <TableCell>
                        {pat.status === 'Active' ? (
                          <Button size="small" color="error">Deactivate</Button>
                        ) : (
                          <Button size="small" color="success">Activate</Button>
                        )}
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

      {activeTab === 2 && <Card><CardContent><Typography>System logs will be displayed here.</Typography></CardContent></Card>}
    </Box>
  );
};

export default AdminDashboardView;
