import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import GradeIcon from '@mui/icons-material/Grade';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import { Appointment } from '../admin-dashboard-view';
import { Doctor } from '../admin-dashboard-view';
import { Rating } from '../admin-dashboard-view';
import { DoctorRatingsSummaryDto } from '../admin-dashboard-view';
import { bloodTypeMap } from './PatientProfile';



interface DoctorProfileCardProps {
  doctor: Doctor;
  appointments?: Appointment[];
  appointmentsLoading?: boolean;
  appointmentsError?: string | null;
  ratings?: DoctorRatingsSummaryDto | null;
}

const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({ doctor, ratings, appointments, appointmentsLoading, appointmentsError }) => {
  const [tab, setTab] = useState(0);
  const safeDate = (d?: string | null) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '-';
    // use the user's locale formatting like the rest of the component
    return dt.toLocaleDateString();
    };

    const dob = new Date(doctor.dateOfBirth);
const today = new Date();

// Calculate age in years, months, days
let years = today.getFullYear() - dob.getFullYear();
let months = today.getMonth() - dob.getMonth();
let days = today.getDate() - dob.getDate();

if (days < 0) {
    months--;
    // get number of days in the previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
}

if (months < 0) {
    years--;
    months += 12;
}

// Convert gender number to string
const genderMap: { [key: number]: string } = {
    0: 'Male',
    1: 'Female',
    2: 'Other' // I noticed you said 3 for other, adjust accordingly
};

const genderText = genderMap[doctor.gender] || 'Unknown';

// Combine into one display string
const ageGenderText = `${years}y ${months}m ${days}d, ${genderText}`;
  const totalAppointments = appointments?.length ?? 0;
    const todaysAppointments = appointments?.filter(appt => {
    const today = new Date();
    const apptDate = new Date(appt.appointmentDate);
    return (
        apptDate.getDate() === today.getDate() &&
        apptDate.getMonth() === today.getMonth() &&
        apptDate.getFullYear() === today.getFullYear()
    );
    }).length ?? 0;

    const pastAppointments = appointments?.filter(appt => {
        const today = new Date();
        const apptDate = new Date(appt.appointmentDate);

        // Compare the full Date objects
        return apptDate < today;
    }).length ?? 0;

    const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        '1': { label: 'Scheduled', color: '#FBBF24', icon: <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        '2': { label: 'Confirmed', color: '#2563EB', icon: <HourglassEmptyIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        '3': { label: 'InProgress', color: '#2563EB', icon: <AutorenewIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        '4': { label: 'Completed', color: '#16A34A', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        '5': { label: 'Cancelled', color: '#DC2626', icon: <CancelIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        '6': { label: 'NoShow', color: '#6B7280', icon: <VisibilityOffIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
    };

    console.log(appointments);


  return (
    <Box>
      {/* Top Card */}
      <Card sx={{ borderRadius: 3, mb: 3 , mt: 3}}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={doctor.avatarUrl || ''}
                sx={{ bgcolor: '#E0ECFF', width: 72, height: 72 }}
              >
                <LocalHospitalIcon sx={{ color: '#2563EB', fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" fontWeight={700}>
                Dr. {doctor.firstName} {doctor.lastName}
              </Typography>
              <Typography color="text.secondary">
                {doctor.specialty} • {doctor.clinicId} • {doctor.experience} years experience
              </Typography>

              <Box display="flex" alignItems="center" mt={1} gap={1}>
                <StarIcon sx={{ color: '#FACC15' }} />
                <Typography fontWeight={600}>{ratings?.averageRating || 0}</Typography>
                <Typography color="text.secondary">
                  ({ratings?.ratingsCount || 0} ratings)
                </Typography>
                
                <Box
                  sx={{
                    backgroundColor: doctor.status === 'Active' ? '#2563EB' : '#9CA3AF',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {doctor.status}
                </Box>
              </Box>

              <Box display="flex" gap={3} mt={1}>
                <Typography color="text.secondary">{doctor.email}</Typography>
                <Typography color="text.secondary">{doctor.phoneNumber}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Total Patients</Typography>
                <Typography variant="h6" fontWeight={700}>{doctor.totalPatients || 0}</Typography>
              </Box>
              <PersonIcon sx={{ color: '#2563EB', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Completed Appointments</Typography>
                <Typography variant="h6" fontWeight={700}>{pastAppointments}</Typography>
              </Box>
              <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Today's Appointments</Typography>
                <Typography variant="h6" fontWeight={700}>{todaysAppointments}</Typography>
              </Box>
              <CalendarTodayIcon sx={{ color: '#F59E0B', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Average Rating</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {ratings?.averageRating || 4.8}{' '}
                  <Typography component="span" color="text.secondary" fontSize={14}>
                    ({ratings?.ratingsCount || 0} ratings)
                  </Typography>
                </Typography>
              </Box>
              <GradeIcon sx={{ color: '#FACC15', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            mr: 1,
          },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Appointments" />
        <Tab label="Reviews & Ratings" />
      </Tabs>

      <Box
        sx={{
            height: 400, // Set a fixed height for all tabs, adjust as needed
            overflowY: 'auto', // Adds vertical scroll when content is taller
            mb: 2,
        }}
        >
            {tab === 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 12px 30px rgba(2,6,23,0.06)', mb: 2 }}>
                <CardContent sx={{ px: 3, py: 2.5 }}>
                {/* Header with Avatar icon */}
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <Avatar sx={{ bgcolor: '#E8F3FF', width: 48, height: 48 }}>
                    <PersonIcon sx={{ color: '#2563EB', fontSize: 26 }} />
                    </Avatar>
                    <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
                        Personal Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Basic demographic and contact information
                    </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    {/* Full Name */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <BadgeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>
                        {doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}` : '-'}
                        </Typography>
                    </Box>
                    </Grid>

                    {/* IDNP */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">IDNP (National ID)</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <BadgeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{doctor.IDNP || '-'}</Typography>
                    </Box>
                    </Grid>

                    {/* Blood Type */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Blood Type</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <BloodtypeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Box
                        component="span"
                        sx={{
                            px: 1.25,
                            py: 0.3,
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            color: '#DC2626',
                            fontWeight: 700,
                            display: 'inline-block',
                            minWidth: 36,
                            textAlign: 'center',
                            fontSize: '0.9rem'
                        }}
                        >
                        {doctor.bloodType ? bloodTypeMap[doctor.bloodType] || doctor.bloodType : '-'}

                        </Box>
                    </Box>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Email Address</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography
                        component={doctor.email ? 'a' : 'span'}
                        href={doctor.email ? `mailto:${doctor.email}` : undefined}
                        sx={{
                            fontWeight: 700,
                            color: doctor.email ? '#2563EB' : 'text.primary',
                            textDecoration: doctor.email ? 'none' : 'inherit',
                        }}
                        >
                        {doctor.email || '-'}
                        </Typography>
                    </Box>
                    </Grid>

                    {/* Date of Birth */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <CakeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{safeDate(doctor.dateOfBirth)}</Typography>
                    </Box>
                    </Grid>

                    {/* Address */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <HomeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{doctor.address || 'N/A'}</Typography>
                    </Box>
                    </Grid>

                    {/* Phone Number */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{doctor.phoneNumber || '-'}</Typography>
                    </Box>
                    </Grid>

                    {/* Age & Gender */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Age & Gender</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{ageGenderText}</Typography>
                    </Box>
                    </Grid>

                    
                </Grid>
                </CardContent>
            </Card>
            )}
        {tab === 1 && (
    <Card sx={{ borderRadius: 3 }}>
        <CardContent>
            {appointmentsLoading && <Typography>Loading appointments...</Typography>}
            {appointmentsError && <Typography color="error">{appointmentsError}</Typography>}
            {!appointmentsLoading && !appointmentsError && appointments?.length === 0 && (
                <Typography>No appointments found.</Typography>
            )}
            {!appointmentsLoading && !appointmentsError && (appointments || []).length > 0 && (
                <Box>
                    {/* Separate upcoming vs past */}
                    <Typography variant="h6" mb={1}>
                        Upcoming Appointments ({(appointments || []).filter(appt => new Date(appt.appointmentDate) > new Date()).length})
                    </Typography>
                    {(appointments || []).filter(appt => new Date(appt.appointmentDate) > new Date()).length === 0 ? (
                        <Typography>No upcoming appointments</Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Notes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(appointments || [])
                                        .filter(appt => new Date(appt.appointmentDate) > new Date())
                                        .map(appt => {
                                            const apptDate = new Date(appt.appointmentDate);
                                            return (
                                                <TableRow key={appt.id}>
                                                    <TableCell>{appt.patientName}</TableCell>
                                                    <TableCell>{apptDate.toLocaleDateString()}</TableCell>
                                                    <TableCell>{apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                    <TableCell>{appt.reason}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={0.5} color={STATUS_MAP[appt.status]?.color || 'black'}>
                                                            {STATUS_MAP[appt.status]?.icon}
                                                            {STATUS_MAP[appt.status]?.label || 'Unknown'}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Typography variant="h6" mb={1}>
                        Appointment History
                    </Typography>
                    {(appointments || []).filter(appt => new Date(appt.appointmentDate) <= new Date()).length === 0 ? (
                        <Typography>No past appointments</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Notes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(appointments || [])
                                        .filter(appt => new Date(appt.appointmentDate) <= new Date())
                                        .map(appt => {
                                            const apptDate = new Date(appt.appointmentDate);
                                            return (
                                                <TableRow key={appt.id}>
                                                    <TableCell>{appt.patientName}</TableCell>
                                                    <TableCell>{apptDate.toLocaleDateString()}</TableCell>
                                                    <TableCell>{apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                    <TableCell>{appt.reason}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={0.5} color={STATUS_MAP[appt.status]?.color || 'black'}>
                                                            {STATUS_MAP[appt.status]?.icon}
                                                            {STATUS_MAP[appt.status]?.label || 'Unknown'}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}
        </CardContent>
    </Card>
)}
        {tab === 2 && (
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <GradeIcon sx={{ color: '#FACC15' }} />
                    <Typography variant="h6" fontWeight={700}>
                    Reviews & Ratings
                    </Typography>
                </Box>

                {/* Summary */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h4" fontWeight={700}>
                    {ratings?.averageRating?.toFixed(1) || "0.0"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                    {[...Array(5)].map((_, i) => (
                        <StarIcon
                        key={i}
                        sx={{
                            fontSize: 24,
                            color: i < Math.round(ratings?.averageRating || 0) ? '#FACC15' : '#E5E7EB',
                        }}
                        />
                    ))}
                    </Box>
                    <Typography color="text.secondary">
                    ({ratings?.ratingsCount || 0} reviews)
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Reviews List */}
                {(!ratings || ratings.ratings.length === 0) && (
                    <Typography color="text.secondary">No reviews yet.</Typography>
                )}

                <Grid container spacing={2}>
                    {ratings?.ratings.map((review) => (
                    <Grid item xs={12} key={review.ratingId}>
                        <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                        }}
                        >
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ bgcolor: '#E0ECFF', width: 40, height: 40 }}>
                                <PersonIcon sx={{ color: '#2563EB' }} />
                                </Avatar>
                                <Box>
                                <Typography fontWeight={600}>
                                    Patient {review.patientId}...
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                                </Box>
                            </Box>
                            <Chip
                                icon={<StarIcon sx={{ fontSize: 16, color: '#ffffffff' }} />}
                                label={review.ratingNr}
                                sx={{
                                bgcolor: '#1da33fff',
                                color: '#ffffffff',
                                fontWeight: 600,
                                }}
                            />
                            </Box>

                            <Typography variant="body2" color="text.primary">
                            {review.ratingCommentary || "No comment provided"}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
                </CardContent>
            </Card>
            )}
        
        </Box>
    </Box>
  );
};

export default DoctorProfileCard;
