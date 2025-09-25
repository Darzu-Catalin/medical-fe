import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CardHeader,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
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
import { Patient } from '../admin-dashboard-view';
import { Vaccine } from '../admin-dashboard-view';
import { Allergy } from '../admin-dashboard-view';


interface PatientProfileCardProps {
  patient: Patient;
  patientAppointments?: Appointment[];
  vaccines?: Vaccine[];
  patientAppointmentsLoading?: boolean;
  vaccinesLoading?: boolean;
  patientAppointmentsError?: string | null;
  vaccinesError?: string | null;
  recentVaccinations?: Vaccine[];
  allergies?: Allergy[];
  allergiesLoading?: boolean;
  allergiesError?: string | null;
}

const PatientProfileCard: React.FC<PatientProfileCardProps> = ({
  patient,
  patientAppointments,
  vaccines,
  patientAppointmentsLoading,
  vaccinesLoading,
  patientAppointmentsError,
  vaccinesError,
  allergies,
  allergiesLoading,
  allergiesError
}) => {
  const [tab, setTab] = useState(0);
  const safeDate = (d?: string | null) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '-';
    // use the user's locale formatting like the rest of the component
    return dt.toLocaleDateString();
    };

    const dob = new Date(patient.dateOfBirth);
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

const genderText = genderMap[patient.gender] || 'Unknown';

// Combine into one display string
const ageGenderText = `${years}y ${months}m ${days}d, ${genderText}`;

  const totalAppointments = patientAppointments?.length ?? 0;
  const upcomingAppointments = patientAppointments?.filter(appt => {
    const today = new Date();
    const apptDate = new Date(appt.appointmentDate);
    return apptDate >= today;
    }).length ?? 0;

    const pastAppointments = patientAppointments?.filter(appt => {
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

  return (
    <Box>
      {/* Top Card */}
      <Card sx={{ borderRadius: 3, mb: 3, mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={ ''}
                sx={{ bgcolor: '#E0ECFF', width: 72, height: 72 }}
              >
                <PersonIcon sx={{ color: '#2563EB', fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" fontWeight={700}>
                {patient.firstName} {patient.lastName}
              </Typography>
              <Typography color="text.secondary">
                {patient.email} • {patient.phoneNumber} • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </Typography>
              <Box
                sx={{
                  backgroundColor: patient.status === 'Active' ? '#2563EB' : '#9CA3AF',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 500,
                  mt: 1,
                  display: 'inline-block',
                }}
              >
                {patient.status}
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
                <Typography color="text.secondary">Upcoming Appointments</Typography>
                <Typography variant="h6" fontWeight={700}>{upcomingAppointments}</Typography>
              </Box>
              <CalendarTodayIcon sx={{ color: '#F59E0B', fontSize: 30 }} />
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
                <Typography color="text.secondary">Vaccines</Typography>
                <Typography variant="h6" fontWeight={700}>{vaccines?.length || 0}</Typography>
              </Box>
              <VaccinesIcon sx={{ color: '#FBBF24', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Allergies</Typography>
                <Typography variant="h6" fontWeight={700}>{allergies?.length || 0}</Typography>
              </Box>
              <ReportProblemOutlinedIcon sx={{ color: '#fb2424ff', fontSize: 30 }} />
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
        <Tab label="Vaccines" />
        <Tab label="Allergies" />
      </Tabs>

      <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
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
                        {patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : '-'}
                        </Typography>
                    </Box>
                    </Grid>

                    {/* IDNP */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">IDNP (National ID)</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <BadgeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{patient.idnp || '-'}</Typography>
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
                        {patient.bloodType || '-'}
                        </Box>
                    </Box>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Email Address</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography
                        component={patient.email ? 'a' : 'span'}
                        href={patient.email ? `mailto:${patient.email}` : undefined}
                        sx={{
                            fontWeight: 700,
                            color: patient.email ? '#2563EB' : 'text.primary',
                            textDecoration: patient.email ? 'none' : 'inherit',
                        }}
                        >
                        {patient.email || '-'}
                        </Typography>
                    </Box>
                    </Grid>

                    {/* Date of Birth */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <CakeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{safeDate(patient.dateOfBirth)}</Typography>
                    </Box>
                    </Grid>

                    {/* Address */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <HomeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{patient.address || 'N/A'}</Typography>
                    </Box>
                    </Grid>

                    {/* Phone Number */}
                    <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Box display="flex" alignItems="center" mt={0.6}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                        <Typography fontWeight={700}>{patient.phoneNumber || '-'}</Typography>
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
              {patientAppointmentsLoading && <Typography>Loading appointments...</Typography>}
              {patientAppointmentsError && <Typography color="error">{patientAppointmentsError}</Typography>}
              {!patientAppointmentsLoading && !patientAppointmentsError && (!patientAppointments || patientAppointments.length === 0) && (
                <Typography>No appointments found.</Typography>
              )}
              {!patientAppointmentsLoading && patientAppointments && patientAppointments.length > 0 && (
                <Box>
                    {/* Separate upcoming vs past */}
                    <Typography variant="h6" mb={1}>
                        Upcoming Appointments ({(patientAppointments || []).filter(appt => new Date(appt.appointmentDate) > new Date()).length})
                    </Typography>
                    {(patientAppointments || []).filter(appt => new Date(appt.appointmentDate) > new Date()).length === 0 ? (
                        <Typography>No upcoming appointments</Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doctor</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Notes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(patientAppointments || [])
                                        .filter(appt => new Date(appt.appointmentDate) > new Date())
                                        .map(appt => {
                                            const apptDate = new Date(appt.appointmentDate);
                                            return (
                                                <TableRow key={appt.id}>
                                                    <TableCell>{appt.doctorName}</TableCell>
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
                        Appointment History ({totalAppointments - upcomingAppointments})
                    </Typography>
                    {(patientAppointments || []).filter(appt => new Date(appt.appointmentDate) <= new Date()).length === 0 ? (
                        <Typography>No past appointments</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doctor</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Notes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(patientAppointments || [])
                                        .filter(appt => new Date(appt.appointmentDate) <= new Date())
                                        .map(appt => {
                                            const apptDate = new Date(appt.appointmentDate);
                                            return (
                                                <TableRow key={appt.id}>
                                                    <TableCell>{appt.doctorName}</TableCell>
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
                <Typography variant="h6" mb={2} fontWeight={600}>
                    Vaccines ({vaccines?.length || 0})
                </Typography>
              {vaccinesLoading && <Typography>Loading vaccines...</Typography>}
              {vaccinesError && <Typography color="error">{vaccinesError}</Typography>}
              {!vaccinesLoading && vaccines && vaccines.length === 0 && <Typography>No vaccines recorded.</Typography>}
              {!vaccinesLoading && vaccines && vaccines.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Vaccine Name</TableCell>
                        <TableCell>Date Administered</TableCell>
                        <TableCell>Administered By</TableCell>
                        <TableCell>Batch Number</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vaccines.map(vac => (
                        <TableRow key={vac.vaccineName}>
                          <TableCell>{vac.vaccineName}</TableCell>
                          <TableCell>{new Date(vac.dateAdministered).toLocaleDateString()}</TableCell>
                          <TableCell>{vac.doctorName || '-'}</TableCell>
                          <TableCell>{vac.batchNumber || '-'}</TableCell>
                          <TableCell>{vac.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 3 && (
            <Card sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
                <CardContent>
                <Typography variant="h6" mb={2} fontWeight={600}>
                    Allergies ({allergies?.length || 0})
                </Typography>

                {allergiesLoading && <Typography>Loading allergies...</Typography>}
                {allergiesError && <Typography color="error">{allergiesError}</Typography>}
                {!allergiesLoading && (allergies || []).length === 0 && <Typography>No allergies recorded.</Typography>}

                {!allergiesLoading && (allergies || []).length > 0 && (
                    <TableContainer
                    component={Paper}
                    >
                    <Table>
                        <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Reaction</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Date Recorded</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {(allergies || []).map(a => (
                            <TableRow key={a.id}>
                            <TableCell>{a.allergenName}</TableCell>
                            <TableCell>{a.severity}</TableCell>
                            <TableCell>{a.reaction || '-'}</TableCell>
                            <TableCell>{a.notes || '-'}</TableCell>
                            <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                )}
                </CardContent>
            </Card>
            )}
        

      </Box>
    </Box>
    
  );
};

export default PatientProfileCard;
