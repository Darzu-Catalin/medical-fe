'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import Iconify from '@/components/iconify';
import MapComponentMemo from '@/components/custom/map/map';
import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG, DEFAULT_MAP_ZOOM } from '@/components/custom/map/map.style';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  postalCode?: string;
  description?: string;
  isActive?: boolean;
}

// ============================================================================
// SAMPLE DATA - REPLACE WITH REAL API WHEN AVAILABLE
// ============================================================================
// This sample data contains 6 medical clinics in Chișinău, Moldova.
// 
// TO USE REAL DATA:
// 1. Create a backend API endpoint that returns clinic data (with lat/lng)
// 2. Import the API function: import { getClinics } from '@/requests/...'
// 3. Update the fetchClinics() function to call your API
// 4. Remove this SAMPLE_CLINICS constant
// 5. Remove the info Alert in the return statement
//
// See README.md for detailed instructions
// ============================================================================
const SAMPLE_CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'Central Medical Clinic',
    address: 'Bd. Ștefan cel Mare și Sfânt 124',
    city: 'Chișinău',
    postalCode: 'MD-2001',
    country: 'Moldova',
    phoneNumber: '+373 22 123-456',
    email: 'contact@centralmedical.md',
    website: 'https://centralmedical.md',
    latitude: 47.0245,
    longitude: 28.8322,
    description: 'Full-service medical center with experienced specialists in various fields.',
    isActive: true,
  },
  {
    id: '2',
    name: 'City Health Center',
    address: 'Str. 31 August 1989, 78',
    city: 'Chișinău',
    postalCode: 'MD-2012',
    country: 'Moldova',
    phoneNumber: '+373 22 234-567',
    email: 'info@cityhealthcenter.md',
    website: 'https://cityhealthcenter.md',
    latitude: 47.0105,
    longitude: 28.8638,
    description: 'Modern healthcare facility offering comprehensive medical services and diagnostics.',
    isActive: true,
  },
  {
    id: '3',
    name: 'Family Medical Practice',
    address: 'Str. Armenească 48',
    city: 'Chișinău',
    postalCode: 'MD-2012',
    country: 'Moldova',
    phoneNumber: '+373 22 345-678',
    email: 'contact@familymedical.md',
    latitude: 47.0167,
    longitude: 28.8497,
    description: 'Dedicated to providing quality primary care for the entire family.',
    isActive: true,
  },
  {
    id: '4',
    name: 'Premier Medical Clinic',
    address: 'Bd. Dacia 16/3',
    city: 'Chișinău',
    postalCode: 'MD-2038',
    country: 'Moldova',
    phoneNumber: '+373 22 456-789',
    email: 'info@premiermedical.md',
    website: 'https://premiermedical.md',
    latitude: 47.0386,
    longitude: 28.8267,
    description: 'Advanced medical care with state-of-the-art equipment and highly qualified doctors.',
    isActive: true,
  },
  {
    id: '5',
    name: 'MedLife Clinic',
    address: 'Str. Alba Iulia 75',
    city: 'Chișinău',
    postalCode: 'MD-2051',
    country: 'Moldova',
    phoneNumber: '+373 22 567-890',
    email: 'contact@medlife.md',
    website: 'https://medlife.md',
    latitude: 47.0055,
    longitude: 28.8189,
    description: 'Comprehensive healthcare services including emergency care and specialized treatments.',
    isActive: true,
  },
  {
    id: '6',
    name: 'Green Valley Medical Center',
    address: 'Str. Ismail 98',
    city: 'Chișinău',
    postalCode: 'MD-2001',
    country: 'Moldova',
    phoneNumber: '+373 22 678-901',
    email: 'info@greenvalley.md',
    latitude: 47.0311,
    longitude: 28.8511,
    description: 'Specializing in preventive medicine and wellness programs.',
    isActive: true,
  },
];

export default function MedicalClinicsMap() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_MAP_LNG,
    latitude: DEFAULT_MAP_LAT,
    zoom: DEFAULT_MAP_ZOOM,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Replace with real API call when backend endpoint is available
      // const response = await getClinics();
      // const clinicsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      // Use sample data for now
      const clinicsData = SAMPLE_CLINICS;
      
      // Filter clinics with valid coordinates
      const clinicsWithCoords = clinicsData.filter(
        (clinic: any) => clinic.latitude && clinic.longitude
      );

      setClinics(clinicsWithCoords);

      // Center map on first clinic if available
      if (clinicsWithCoords.length > 0 && clinicsWithCoords[0].latitude && clinicsWithCoords[0].longitude) {
        setViewState(prev => ({
          ...prev,
          latitude: clinicsWithCoords[0].latitude!,
          longitude: clinicsWithCoords[0].longitude!,
          zoom: 12,
        }));
      }
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError(err.message || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={5}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={3}>
            <Iconify icon="mdi:alert-circle-outline" width={48} color="error.main" />
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Currently displaying sample clinic data for demonstration. 
          Replace with real clinic data from your backend API when available.
        </Typography>
      </Alert>

      {/* Map Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Medical Clinics in Your Zone
            </Typography>
            <Chip 
              label={`${clinics.length} ${clinics.length === 1 ? 'Clinic' : 'Clinics'}`} 
              color="primary" 
              size="small"
            />
          </Box>

          {clinics.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={5}
            >
              <Iconify icon="mdi:hospital-marker" width={64} color="text.disabled" />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No clinics with location data found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              height: { xs: 500, sm: 600, md: 700 }, 
              width: '100%', 
              borderRadius: 2, 
              overflow: 'hidden',
              aspectRatio: { md: '1/1' }
            }}>
              <MapComponentMemo
                markers={clinics}
                onViewStateChange={(e: any) => {
                  setViewState(e);
                }}
                initialViewState={{
                  lat: viewState.latitude,
                  lng: viewState.longitude,
                }}
                renderPopup={(clinic: Clinic) => (
                  <Box sx={{ 
                    p: 0,
                    minWidth: '220px', 
                    maxWidth: '280px',
                  }}>
                    {/* Clinic Name */}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: '1rem',
                      }}
                    >
                      {clinic.name}
                    </Typography>

                    {/* Status Badge */}
                    {clinic.isActive !== undefined && (
                      <Chip
                        label={clinic.isActive ? 'Active' : 'Inactive'}
                        color={clinic.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ mb: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}

                    {/* Address */}
                    {clinic.address && (
                      <Box display="flex" alignItems="flex-start" gap={0.5} mb={0.5}>
                        <Iconify 
                          icon="mdi:map-marker" 
                          width={14} 
                          sx={{ 
                            color: 'text.secondary',
                            mt: '2px',
                            flexShrink: 0 
                          }} 
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.3,
                            fontSize: '0.75rem',
                          }}
                        >
                          {clinic.address}
                          {clinic.city && `, ${clinic.city}`}
                        </Typography>
                      </Box>
                    )}

                    {clinic.postalCode && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: 'text.secondary',
                          mb: 0.5,
                          fontSize: '0.7rem',
                        }}
                      >
                        {clinic.postalCode}
                      </Typography>
                    )}

                    {/* Description */}
                    {clinic.description && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          mt: 1,
                          mb: 1,
                          color: 'text.secondary',
                          lineHeight: 1.3,
                          fontSize: '0.7rem',
                        }}
                      >
                        {clinic.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Contact Actions */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      {clinic.phoneNumber && (
                        <IconButton 
                          size="small" 
                          href={`tel:${clinic.phoneNumber}`}
                          sx={{
                            p: 0.5,
                            backgroundColor: 'action.hover',
                            '&:hover': { 
                              backgroundColor: 'primary.main', 
                              color: 'white' 
                            },
                          }}
                        >
                          <Iconify icon="bi:telephone-fill" width={14} />
                        </IconButton>
                      )}

                      {clinic.email && (
                        <IconButton 
                          size="small" 
                          href={`mailto:${clinic.email}`}
                          sx={{
                            p: 0.5,
                            backgroundColor: 'action.hover',
                            '&:hover': { 
                              backgroundColor: 'primary.main', 
                              color: 'white' 
                            },
                          }}
                        >
                          <Iconify icon="bi:envelope-fill" width={14} />
                        </IconButton>
                      )}

                      {clinic.website && (
                        <IconButton 
                          size="small" 
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            p: 0.5,
                            backgroundColor: 'action.hover',
                            '&:hover': { 
                              backgroundColor: 'primary.main', 
                              color: 'white' 
                            },
                          }}
                        >
                          <Iconify icon="bi:link-45deg" width={14} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Clinics List Section */}
      {clinics.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Clinics List
            </Typography>
            <List sx={{ width: '100%' }}>
              {clinics.map((clinic, index) => (
                <Box key={clinic.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <Iconify icon="mdi:hospital-building" width={28} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {clinic.name}
                          </Typography>
                          {clinic.isActive !== undefined && (
                            <Chip
                              label={clinic.isActive ? 'Active' : 'Inactive'}
                              color={clinic.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {clinic.address && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <Iconify icon="mdi:map-marker" width={16} />
                              <Typography variant="body2" color="text.secondary">
                                {clinic.address}
                                {clinic.city && `, ${clinic.city}`}
                                {clinic.postalCode && ` ${clinic.postalCode}`}
                              </Typography>
                            </Box>
                          )}
                          {clinic.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {clinic.description}
                            </Typography>
                          )}
                          <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                            {clinic.phoneNumber && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Iconify icon="bi:telephone-fill" />}
                                href={`tel:${clinic.phoneNumber}`}
                                sx={{ textTransform: 'none' }}
                              >
                                {clinic.phoneNumber}
                              </Button>
                            )}
                            {clinic.email && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Iconify icon="bi:envelope-fill" />}
                                href={`mailto:${clinic.email}`}
                                sx={{ textTransform: 'none' }}
                              >
                                Email
                              </Button>
                            )}
                            {clinic.website && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Iconify icon="bi:link-45deg" />}
                                href={clinic.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textTransform: 'none' }}
                              >
                                Website
                              </Button>
                            )}
                            {clinic.latitude && clinic.longitude && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Iconify icon="mdi:google-maps" />}
                                href={`https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  textTransform: 'none',
                                  backgroundColor: '#4285F4',
                                  '&:hover': { backgroundColor: '#357ABD' }
                                }}
                              >
                                Open in Google Maps
                              </Button>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < clinics.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
