'use client';

import { Box, Typography, Card, Grid, Divider, CardContent, Tabs, Tab, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';

const PatientsDashboardView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); // Log the token for debugging

      if (!token) {
        console.error('No token found in localStorage.');
        alert('You are not logged in. Please log in to continue.');
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_HOST_API;
      if (!apiBaseUrl) {
        throw new Error('API base URL is not defined in the environment variables.');
      }

      const res = await fetch(`${apiBaseUrl}/api/patient/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please check your credentials.');
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await res.json();
      console.log('Dashboard API Response:', data); // Log the entire API response

      if (data && data.data) {
        console.log('Dashboard Data:', data.data); // Log the dashboard data
        setDashboardData(data.data); // Set the dashboard data
      } else {
        console.warn('No dashboard data found in the response.');
        setDashboardData(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData(null);
      if (err.message.includes('Unauthorized')) {
        alert('Your session has expired. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    console.log('Updated dashboardData:', dashboardData); // Log dashboardData whenever it changes
  }, [dashboardData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
        <Tab label="Home" />
        <Tab label="Profile" />
        <Tab label="Vaccines" />
        <Tab label="Visits" />
        <Tab label="Audit Log" />
      </Tabs>

      {/* Tab content */}
      {dashboardData ? (
        <>
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Contact Info</Typography>
                    <Typography>Phone: {dashboardData.profile?.phoneNumber || 'N/A'}</Typography>
                    <Typography>Address: {dashboardData.profile?.address || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Card sx={{ mb: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your basic health profile information
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                      <Typography fontWeight={500}>
                        {dashboardData.profile?.firstName} {dashboardData.profile?.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">IDNP:</Typography>
                      <Typography fontWeight={500}>{dashboardData.profile?.idnp || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                      <Typography fontWeight={500}>
                        {dashboardData.profile?.dateOfBirth
                          ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dashboardData.profile.dateOfBirth))
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Blood Type:</Typography>
                      <Typography color="primary" sx={{ px: 1 }}>{dashboardData.profile?.bloodType || 'N/A'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Phone:</Typography>
                      <Typography fontWeight={500}>{dashboardData.profile?.phone || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Address:</Typography>
                      <Typography fontWeight={500}>{dashboardData.profile?.address || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Known Allergies
                  </Typography>

                  {dashboardData.profile?.activeAllergies && dashboardData.profile.activeAllergies.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {dashboardData.profile.activeAllergies.map((allergy: any, index: number) => (
                        <Typography
                          key={index}
                          sx={{
                            display: 'inline-block',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                          }}
                        >
                          {allergy.AllergenName}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No known allergies.</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vaccination History
                </Typography>
                {dashboardData.profile?.recentVaccinations && dashboardData.profile.recentVaccinations.length > 0 ? (
                  <ul>
                    {dashboardData.profile.recentVaccinations.map((vaccine: any, index: number) => (
                      <li key={index}>
                        {vaccine.VaccineName} - {new Date(vaccine.DateAdministered).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography color="text.secondary">No vaccinations recorded.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visit History
                </Typography>
                {dashboardData.visits && dashboardData.visits.length > 0 ? (
                  <ul>
                    {dashboardData.visits.map((visit: any, index: number) => (
                      <li key={index}>
                        {new Date(visit.VisitDate).toLocaleDateString()} - {visit.Diagnosis}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography color="text.secondary">No visits yet.</Typography>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No dashboard data found. Please try again later.
        </Typography>
      )}
    </Box>
  );
};

export default PatientsDashboardView;
