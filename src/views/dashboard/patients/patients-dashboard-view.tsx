'use client';

import { 
  Box, 
  Typography, 
  Card, 
  Grid, 
  CardContent, 
  CardHeader, 
  Button,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { 
  CalendarToday, 
  LocalHospital,
  Assignment,
  Favorite,
  TrendingUp,
  Schedule,
  Person,
} from '@mui/icons-material';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useAppointmentsForCalendar, appointmentStatusMap } from '@/requests/appointments.requests';

// Minimal types for the data we render
interface Visit {
  visitDate: string;
  doctorName: string;
  diagnosis?: string;
  notes?: string;
  symptoms?: string;
  treatment?: string;
}

interface Vaccine {
  vaccineName: string;
  dateAdministered: string;
}

interface Allergy {
  allergenName: string;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  idnp?: string;
  dateOfBirth?: string;
  bloodType?: string;
  phoneNumber?: string;
  address?: string;
  recentVaccinations?: Vaccine[];
  activeAllergies?: Allergy[];
}

interface DashboardData {
  profile: Profile;
  visits: Visit[];
}

const PatientsDashboardView = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Get appointments data
  const { appointments = [], appointmentsLoading } = useAppointmentsForCalendar();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sessionToken = getSession() || localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!sessionToken) {
        throw new Error('Unauthorized. No session token found.');
      }

      const res = await axiosInstance.get('/patient/dashboard', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      const payload = res.data;
      if (payload && payload.data) {
        setDashboardData(payload.data);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      setDashboardData(null);
      const axiosErr = err as AxiosError<any>;
      const status = axiosErr?.response?.status;
      if (status === 401) {
        alert('Your session has expired. Please log in again.');
      } else if (status === 403) {
        alert('You do not have permission to view this dashboard.');
      }
      console.error('Error fetching dashboard data:', axiosErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate appointment statistics
  const upcomingAppointments = appointments.filter(apt => new Date(apt.appointmentDate) > new Date()).length;
  const completedAppointments = appointments.filter(apt => apt.status === 4).length;
  const totalAppointments = appointments.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your personal health overview
      </Typography>

      {loading || appointmentsLoading ? (
        <Typography>Loading your dashboard...</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <Schedule />
                    </Avatar>
                    <Typography variant="h4" color="primary">
                      {upcomingAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming Appointments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                      <Assignment />
                    </Avatar>
                    <Typography variant="h4" color="success.main">
                      {completedAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Visits
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <LocalHospital />
                    </Avatar>
                    <Typography variant="h4" color="info.main">
                      {totalAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Appointments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                      <Person />
                    </Avatar>
                    <Typography variant="h4" color="secondary.main">
                      {dashboardData ? '1' : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Profile Complete
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="primary" />
                    <Typography variant="h6">Recent Activity</Typography>
                  </Box>
                }
              />
              <CardContent>
                {appointments.length > 0 ? (
                  <Stack spacing={2}>
                    {appointments.slice(0, 3).map((appointment, index) => (
                      <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <LocalHospital />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Appointment with Dr. {appointment.doctorName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.specialty} • {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              {appointment.reason || 'General consultation'}
                            </Typography>
                          </Box>
                          <Chip
                            label={appointmentStatusMap[appointment.status]?.label || 'Unknown'}
                            size="small"
                            sx={{
                              bgcolor: appointmentStatusMap[appointment.status]?.bgColor || '#f5f5f5',
                              color: appointmentStatusMap[appointment.status]?.color || '#000',
                            }}
                          />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No appointments yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Book your first appointment to get started
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => router.push('/dashboard/calendar')}
                      startIcon={<CalendarToday />}
                    >
                      Book Appointment
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Favorite color="error" />
                    <Typography variant="h6">Quick Actions</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CalendarToday />}
                    onClick={() => router.push('/dashboard/calendar')}
                    sx={{ py: 1.5 }}
                  >
                    My Appointments
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assignment />}
                    onClick={() => router.push('/dashboard/documents')}
                    sx={{ py: 1.5 }}
                  >
                    My Documents
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Person />}
                    onClick={() => router.push('/dashboard/profile')}
                    sx={{ py: 1.5 }}
                  >
                    My Profile
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LocalHospital />}
                    onClick={() => router.push('/dashboard/vaccines')}
                    sx={{ py: 1.5 }}
                  >
                    My Vaccines
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Health Summary */}
            {dashboardData?.profile && (
              <Card sx={{ mt: 2 }}>
                <CardHeader title="Health Summary" />
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Blood Type:
                      </Typography>
                      <Chip
                        label={dashboardData.profile.bloodType || 'Unknown'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    {dashboardData.profile.activeAllergies && dashboardData.profile.activeAllergies.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Allergies:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {dashboardData.profile.activeAllergies.slice(0, 3).map((allergy: any, index: number) => (
                            <Chip
                              key={index}
                              label={allergy.allergenName}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PatientsDashboardView;