'use client';

import { Box, Typography, Card, Grid, Divider, CardContent, CardHeader,  Tabs, Tab, TextField, Button } from '@mui/material';
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
    {/* Last Visit Card */}
    <Grid item xs={12} md={4}>
      <Card>
        <CardHeader title="Last Visit" />
        <CardContent>
          {dashboardData.visits && dashboardData.visits.length > 0 ? (
            (() => {
              const lastVisit = dashboardData.visits[0];
              return (
                <Box>
                  <Typography variant="subtitle1">{new Date(lastVisit.visitDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2">Doctor: {lastVisit.doctorName}</Typography>
                  <Typography variant="body2">Diagnosis: {lastVisit.diagnosis || "N/A"}</Typography>
                  <Typography variant="body2">Notes: {lastVisit.notes || "N/A"}</Typography>
                </Box>
              );
            })()
          ) : (
            <Typography variant="body2">No visits yet</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* Vaccines Card */}
    <Grid item xs={12} md={4}>
      <Card>
        <CardHeader title="Vaccines" />
        <CardContent>
          {dashboardData.profile.recentVaccinations && dashboardData.profile.recentVaccinations.length > 0 ? (
            dashboardData.profile.recentVaccinations.slice(0, 2).map((vaccine: any, index: number) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="subtitle1">{vaccine.vaccineName}</Typography>
                <Typography variant="body2">
                  Date: {new Date(vaccine.dateAdministered).toLocaleDateString()}
                </Typography>
                {vaccine.BatchNumber && (
                  <Typography variant="body2">Batch: {vaccine.BatchNumber}</Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2">No vaccinations yet</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* Health Alerts Card */}
    <Grid item xs={12} md={4}>
      <Card>
        <CardHeader title="Health Alerts" />
        <CardContent>
          {dashboardData.profile.activeAllergies && dashboardData.profile.activeAllergies.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {dashboardData.profile.activeAllergies.map((allergy: any, index: number) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    backgroundColor: '#d9534f',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {allergy.allergenName}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No allergens.</Typography>
          )}
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
                      <Typography fontWeight={500}>{dashboardData.profile?.phoneNumber || 'N/A'}</Typography>
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
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          backgroundColor: '#d9534f',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                  {allergy.allergenName}
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your complete vaccination record
                </Typography>
                {dashboardData.profile?.recentVaccinations && dashboardData.profile.recentVaccinations.length > 0 ? (
                  <ul>
                    {dashboardData.profile.recentVaccinations.map((vaccine: any, index: number) => (
                      <li key={index}>
                        {vaccine.vaccineName} - {new Date(vaccine.dateAdministered).toLocaleDateString()}
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                Your complete medical visit history
                </Typography>
                {dashboardData.visits && dashboardData.visits.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
                       {dashboardData.visits.map((visit: any, index: number) => (
                        
                        <Card sx={{ p:2}}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {new Date(visit.visitDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {visit.doctorName}
                          </Typography>
                          </Box>

                          <Grid container spacing={2}>
                          {/* Left Column */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">Symptoms:</Typography>
                              <Typography variant="body2">{visit.symptoms || "N/A"}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Diagnosis:</Typography>
                              <Typography variant="body2" fontWeight={600}>{visit.diagnosis || "N/A"}</Typography>
                            </Box>
                          </Grid>

                          {/* Right Column */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">Treatment:</Typography>
                              <Typography variant="body2">{visit.treatment || "N/A"}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Doctor's Notes:</Typography>
                              <Typography variant="body2">{visit.notes || "N/A"}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        </Card>
                      ))}
                  </Box>
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
