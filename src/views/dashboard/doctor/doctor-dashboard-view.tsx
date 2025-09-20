'use client';

import { Box, Typography, Card, Grid, Divider, CardContent, CardHeader,  Tabs, Tab, TextField, Button, InputAdornment, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import { CalendarToday, SecurityOutlined, WarningAmberOutlined} from '@mui/icons-material';




const DoctorDashboardView = () => {
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

      const res = await fetch(`${apiBaseUrl}/api/doctor`, {
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
        Doctor Dashboard
      </Typography>


      {/* Add Visit Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => {
          // TODO: Replace with modal or navigation to add visit form
          alert('Add Visit functionality coming soon!');
        }}
      >
        Add Visit
      </Button>

      {/* Search Patient Container */}
      <Box
        sx={{
          mb: 3,
          border: '2px solid #152331ff',
          borderRadius: 2,
          backgroundColor: '#223043e0',
          p: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SearchIcon color="action" />
          <Typography variant="subtitle1" fontWeight={500}>Search Patient</Typography>
        </Box>
        <Box>
          <TextField
            sx={{ width: '90%' }}
            placeholder="Enter patient name or ID..."
            variant="outlined"
            size="small"
          />
          <Button
            sx={{ width: '8%', ml: "1%" }}
            variant="contained"
            color="primary"
            onClick={() => {
              alert('Search patient functionality coming soon!');
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Upcoming Appointments Container */}
      <Box
        sx={{
          mb: 3,
          border: '2px solid #152331ff',
          borderRadius: 2,
          backgroundColor: '#223043e0',
          p: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="subtitle1" fontWeight={500}>Upcoming Appointments</Typography>
        </Box>
        {/* Future Appointments List */}
        {dashboardData && dashboardData.appointments && dashboardData.appointments.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dashboardData.appointments
              .filter((appt: any) => new Date(appt.date) > new Date())
              .map((appt: any, idx: number) => (
                <Box key={idx} sx={{ border: '1px solid #1976d2', borderRadius: 1, p: 2, backgroundColor: '#fff' }}>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    Patient: {appt.patientName}
                  </Typography>
                  <Typography variant="body2">
                    Date: {new Date(appt.date).toLocaleDateString()} at {appt.time}
                  </Typography>
                  <Typography variant="body2">
                    Reason: {appt.reason || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Status: {appt.status || 'Scheduled'}
                  </Typography>
                </Box>
              ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No upcoming appointments.</Typography>
        )}
      </Box>
      
    </Box>
  );
};

export default DoctorDashboardView;
