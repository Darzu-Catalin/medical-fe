'use client';

import { Box, Typography, Card, Grid, Divider, CardContent, CardHeader,  Tabs, Tab, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { CalendarToday, SecurityOutlined, WarningAmberOutlined} from '@mui/icons-material';




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
        <CardHeader title={
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6" fontWeight={100} >Last Visit</Typography>
                </Box>
              }
            />
        <CardContent>
          {dashboardData.visits && dashboardData.visits.length > 0 ? (
            (() => {
              const lastVisit = dashboardData.visits[0];
              return (
                <Box  display="flex"  flexDirection="column" gap={2}>
                  {/* Date */}
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontSize="1.1rem" color="text.secondary">
                      Date:
                    </Typography>
                    <Typography variant="body2" fontSize="1.1rem">
                      {new Date(lastVisit.visitDate).toLocaleDateString()}
                    </Typography>
                  </Box>   

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontSize="1.1rem" color="text.secondary">
                      Doctor:
                    </Typography>
                    <Typography variant="body2" fontSize="1.1rem">
                    {lastVisit.doctorName}
                    </Typography>
                  </Box>                 
                  <Divider />

                   {/* Diagnosis */}
                <Box>
                  <Typography variant="body2" color="text.secondary" >
                    Diagnosis:
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                    {lastVisit.diagnosis || "N/A"}
                  </Typography>
                </Box>
                  
                {/* Notes */}
                <Box>
                  <Typography variant="body2" color="text.secondary" >
                    Notes:
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem">
                    {lastVisit.notes || "N/A"}
                  </Typography>
                </Box>                
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
      <CardHeader title={
                <Box display="flex" alignItems="center" gap={1}>
                  <SecurityOutlined color="success" />
                  <Typography variant="h6" fontWeight={100} > Vaccines</Typography>
                </Box>
              }
            />
        <CardContent>
          {dashboardData.profile.recentVaccinations && dashboardData.profile.recentVaccinations.length > 0 ? (
            dashboardData.profile.recentVaccinations.slice(0, 2).map((vaccine: any, index: number) => (
              
              <Box key={index} sx={{mb: 1, border: "1px solid #ffea08", borderRadius: 2, p: 2, backgroundColor:"#fdffe7"
              }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                  {vaccine.vaccineName}</Typography>
                  <Typography color="#cfa715" border="1px solid #ffea08" borderRadius={1} px={2}> {new Date(vaccine.dateAdministered) <= new Date() ? "Done" : "Not done"}</Typography>
                </Box>
                
          
                <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                  Date: {new Date(vaccine.dateAdministered).toLocaleDateString()}
                </Typography>
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
      <CardHeader title={
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningAmberOutlined color="error" />
                  <Typography variant="h6" fontWeight={100} > Health Alerts</Typography>
                </Box>
              }
            />
        <CardContent>
          {dashboardData.profile.activeAllergies && dashboardData.profile.activeAllergies.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection:'column', gap: 1, mb: 1, border: "1px solid #ffa592", borderRadius: 2, p: 2, backgroundColor:"#fff0f2"}}>

                <Box display="flex" sx={{ mb: 1 }}>
                <WarningAmberOutlined color="error" sx={{mr:1}} />
                  <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                  Allergies</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                  )
                )}
                </Box>
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
              <CardContent sx={{ fontSize: '1.1rem' }}>
                <Typography variant="h6" gutterBottom >
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom  fontSize="1.1rem">
                  Your basic health profile information
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }} >
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem' >Full Name:</Typography>
                      <Typography fontWeight={500} fontSize= '1.1rem'>
                        {dashboardData.profile?.firstName} {dashboardData.profile?.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem'>IDNP:</Typography>
                      <Typography fontWeight={500} fontSize= '1.1rem'>{dashboardData.profile?.idnp || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem'>Date of Birth:</Typography>
                      <Typography fontWeight={500} fontSize= '1.1rem'>
                        {dashboardData.profile?.dateOfBirth
                          ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dashboardData.profile.dateOfBirth))
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem'>Blood Type:</Typography>
                      <Typography color="primary" sx={{ px: 1 }} fontSize= '1.1rem'>{dashboardData.profile?.bloodType || 'N/A'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem'>Phone:</Typography>
                      <Typography fontWeight={500} fontSize= '1.1rem'>{dashboardData.profile?.phoneNumber || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontSize= '1.1rem'>Address:</Typography>
                      <Typography fontWeight={500} fontSize= '1.1rem'>{dashboardData.profile?.address || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box>
                <Typography variant="h6" gutterBottom>
                  Known Allergies
                </Typography>

                {dashboardData.profile?.activeAllergies && dashboardData.profile.activeAllergies.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {dashboardData.profile.activeAllergies.map((allergy: any, index: number) => (
                      <Box key={index} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 , backgroundColor: '#d9534f', color: '#fff', padding: '4px 12px',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 500,}}>
                        <WarningAmberOutlined sx={{color: '#fff', fontSize: '1rem'}}/>
                        <Typography>{allergy.allergenName}</Typography>
                      </Box>
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
            <Card sx={{ mb: 3, p: 2}}>
              <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityOutlined sx={{ fontSize: 28, color: '#000' }} />
                <Typography variant="h6" gutterBottom >
                  Vaccination History
                </Typography>
            </Box>
                <Typography variant="body2" color="text.secondary"  fontSize="1.1rem" gutterBottom>
                  Your complete vaccination record
                </Typography>
                {dashboardData.profile.recentVaccinations && dashboardData.profile.recentVaccinations.length > 0 ? (
                dashboardData.profile.recentVaccinations.slice(0, 2).map((vaccine: any, index: number) => (
                  
                  <Box key={index} sx={{mb: 1, border: "1px solid #b1b1b1", borderRadius: 2, p: 2}}>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                      {vaccine.vaccineName}</Typography>
                      <Typography border="1px solid #b1b1b1" borderRadius={1} px={2}> {new Date(vaccine.dateAdministered) <= new Date() ? "Done" : "Not done"}</Typography>
                    </Box>
                    
              
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                    Administered: {new Date(vaccine.dateAdministered).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No vaccinations yet</Typography>
          )}
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card sx={{ mb: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visit History
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom  fontSize="1.1rem">
                Your complete medical visit history
                </Typography>
                {dashboardData.visits && dashboardData.visits.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
                       {dashboardData.visits.map((visit: any, index: number) => (
                        
                        <Card sx={{ p:2, border: "1px solid #b1b1b1", borderRadius: 2}}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                            {new Date(visit.visitDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 , fontSize: "1.1rem", border: "1px solid #b1b1b1", borderRadius: 1, px:2}}>
                            {visit.doctorName}
                          </Typography>
                          </Box>

                          <Grid container spacing={2}>
                          {/* Left Column */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontSize= "1.1rem">Symptoms:</Typography>
                              <Typography variant="body2" fontSize= "1.1rem">{visit.symptoms || "N/A"}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontSize= "1.1rem">Diagnosis:</Typography>
                              <Typography variant="body2" fontWeight={600} fontSize= "1.1rem">{visit.diagnosis || "N/A"}</Typography>
                            </Box>
                          </Grid>

                          {/* Right Column */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontSize= "1.1rem">Treatment:</Typography>
                              <Typography variant="body2" fontSize= "1.1rem">{visit.treatment || "N/A"}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontSize= "1.1rem">Doctor's Notes:</Typography>
                              <Typography variant="body2" fontSize= "1.1rem">{visit.notes || "N/A"}</Typography>
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
