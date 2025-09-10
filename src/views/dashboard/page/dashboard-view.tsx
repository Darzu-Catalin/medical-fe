'use client';

import ComingSoonIllustration from "@/assets/illustrations/coming-soon-illustration";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from 'react';
import PatientsDashboardView from '../patients/patients-dashboard-view';

const DashboardView = () => {
  const [role, setRole] = useState<string | null>(null);

  // Function to decode the token and extract the role
  const decodeToken = (token: string) => {
    try {
      console.log('Decoding token:', token); // Log the token being decoded
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      console.log('Decoded Token:', decoded); // Log the decoded token
      return decoded;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Log the token retrieved from localStorage
    if (token) {
      const decodedToken = decodeToken(token);
      const role = decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      console.log('Role from decoded token:', role); // Log the role extracted from the token
      setRole(role || null);
    } else {
      console.warn('No token found in localStorage.');
    }
  }, []);

  // Render based on role
  if (role === 'Patient') {
    console.log('Rendering PatientsDashboardView for role:', role); // Log the role being rendered
    return <PatientsDashboardView />;
  }

  console.log('Rendering default "Coming Soon" view for role:', role); // Log the fallback rendering
  return (
    <Box
      sx={{
        maxWidth: 480,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ComingSoonIllustration />
      <Typography sx={{ mt: 2 }}>Coming soon...</Typography>
    </Box>
  );
};

export default DashboardView;