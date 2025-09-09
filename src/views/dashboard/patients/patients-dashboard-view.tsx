'use client';

import { Box, Typography, Card, Grid, Divider, CardContent, Tabs, Tab, Badge } from '@mui/material';
import { useState, useEffect } from 'react';

const mockPatientData = {
  profile: {
    name: 'John Smith',
    idnp: '2001234567890',
    dob: '1990-05-15',
    bloodType: 'A+',
    phone: '+373 69 123 456',
    address: 'Chisinau, Stefan cel Mare 123',
  },
  allergies: ['Penicillin', 'Peanuts'],
  visits: [
    {
      id: '1',
      date: '2024-01-15',
      doctor: 'Dr. Sarah Johnson',
      symptoms: 'Fever, headache, body aches',
      diagnosis: 'Viral infection',
      prescription: 'Rest, fluids, paracetamol 500mg every 6h',
      notes: 'bady teeth',
    },
    {
      id: '2',
      date: '2023-11-20',
      doctor: 'Dr. Michael Brown',
      symptoms: 'Annual checkup',
      diagnosis: 'Healthy',
      prescription: 'Continue lifestyle, multivitamin',
      notes: 'bady teeth',
    },
  ],
};


const PatientsDashboardView = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [patientData, setPatientData] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch('http://localhost:5152/api/admin/test/users-count'); // change port if needed
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
  
        // Take the first user to test
        if (data.Users && data.Users.length > 0) {
          setPatientData(data.Users[0]);
          console.log('Fetched patient:', data.Users[0]);
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPatient();
  }, []);
  

  if (loading) return <p>Loading patient data...</p>;
  if (!patientData) return <p>No patient data found.</p>;
  return (

    <Box sx={{ p: 3 }}>
        
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      <Typography variant="body1" gutterBottom>
        View personal record.
      </Typography>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
        <Tab label="Home"/>
        <Tab label="Profile" />
        <Tab label="Vaccines" />
        <Tab label="Visits" />
        <Tab label="Audit Log" />
      </Tabs>

      {/* Tab content */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Last Visit</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Date:</Typography>
                            <Typography variant="body2" color="text.secondary">{mockPatientData.visits[1].date}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Doctor:</Typography>
                            <Typography variant="body2" color="text.secondary">{mockPatientData.visits[1].doctor}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Diagnosis:</Typography>
                            <Typography variant="body2" color="text.secondary">{mockPatientData.visits[1].diagnosis}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Notes:</Typography>
                            <Typography variant="body2" color="text.secondary">{mockPatientData.visits[1].notes}</Typography>
                        </Box>
                        </CardContent>
                </Card>
            </Grid>

               {/* Example Card 2 */}
                <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <CardContent>
                    <Typography variant="h6">Upcoming Vaccines</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        
                    </Box>
                    </CardContent>
                </Card>
                </Grid>

                {/* Example Card 3 */}
                <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <CardContent>
                    <Typography variant="h6">Contact Info</Typography>
                    <Typography>Phone: {mockPatientData.profile.phone}</Typography>
                    <Typography>Address: {mockPatientData.profile.address}</Typography>
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
                <Typography fontWeight={500}> {patientData.FirstName} {patientData.LastName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">IDNP:</Typography>
                <Typography fontWeight={500}>{mockPatientData.profile.idnp}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                <Typography fontWeight={500}>{mockPatientData.profile.dob}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Blood Type:</Typography>
                <Badge color="primary" sx={{ px: 1 }}>{mockPatientData.profile.bloodType}</Badge>
              </Box>
            </Grid>
    
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                <Typography fontWeight={500}>{mockPatientData.profile.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Address:</Typography>
                <Typography fontWeight={500}>{mockPatientData.profile.address}</Typography>
              </Box>
            </Grid>
          </Grid>
    
          <Divider sx={{ my: 2 }} />
    
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Known Allergies
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mockPatientData.allergies.map((allergy) => (
                <Badge
                  key={allergy}
                  color="error"
                  sx={{ px: 1 }}
                >
                  {allergy}
                </Badge>
              ))}
            </Box>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Card variant="outlined">
                <CardContent>
                    <Typography variant="subtitle1">Vaccine 1</Typography>
                    <Typography variant="body2">Details about vaccine 1</Typography>
                </CardContent>
                </Card>
            </Box>
            </CardContent>
        </Card>

      )}

{activeTab === 3 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {mockPatientData.visits.map((visit) => (
      <Card key={visit.id} variant="outlined">
        <CardContent>
          {/* Header: date and doctor */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography fontWeight={600}>{visit.date}</Typography>
            <Badge
              color="primary"
              sx={{ px: 1, borderRadius: 1 }}
            >
              {visit.doctor}
            </Badge>
          </Box>

          {/* Visit details in two columns */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Symptoms:
                </Typography>
                <Typography fontWeight={500}>{visit.symptoms}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Diagnosis:
                </Typography>
                <Typography fontWeight={500}>{visit.diagnosis}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Prescription:
                </Typography>
                <Typography fontWeight={500}>{visit.prescription}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Doctor's Notes:
                </Typography>
                <Typography fontWeight={500}>
                  {visit.notes || '—'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    ))}
  </Box>
)}


{activeTab === 4 && (
            <Card sx={{ mb: 3 }}>
            <CardContent>
             
            </CardContent>
            </Card>
        )}


    </Box>
  );
};

export default PatientsDashboardView;
