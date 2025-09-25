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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VaccinesIcon from '@mui/icons-material/Vaccines';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
}

export interface PatientAppointment {
  id: number;
  doctorName: string;
  appointmentDate: string;
  status: string;
  reason?: string;
}

export interface Vaccine {
  id: number;
  name: string;
  dateAdministered: string;
  nextDose?: string;
}

interface PatientProfileCardProps {
  patient: Patient;
  appointments?: PatientAppointment[];
  vaccines?: Vaccine[];
  appointmentsLoading?: boolean;
  vaccinesLoading?: boolean;
  appointmentsError?: string | null;
  vaccinesError?: string | null;
}

const PatientProfileCard: React.FC<PatientProfileCardProps> = ({
  patient,
  appointments,
  vaccines,
  appointmentsLoading,
  vaccinesLoading,
  appointmentsError,
  vaccinesError,
}) => {
  const [tab, setTab] = useState(0);

  const totalAppointments = appointments?.length ?? 0;
  const upcomingAppointments = appointments?.filter(appt => new Date(appt.appointmentDate) > new Date()).length ?? 0;
  const completedAppointments = appointments?.filter(appt => new Date(appt.appointmentDate) <= new Date()).length ?? 0;

  return (
    <Box>
      {/* Top Card */}
      <Card sx={{ borderRadius: 3, mb: 3, mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={patient.avatarUrl || ''}
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
                <Typography color="text.secondary">Total Appointments</Typography>
                <Typography variant="h6" fontWeight={700}>{totalAppointments}</Typography>
              </Box>
              <PersonIcon sx={{ color: '#2563EB', fontSize: 30 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary">Upcoming</Typography>
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
                <Typography color="text.secondary">Completed</Typography>
                <Typography variant="h6" fontWeight={700}>{completedAppointments}</Typography>
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
        <Tab label="Appointments" />
        <Tab label="Vaccines" />
        <Tab label="Medical History" />
      </Tabs>

      <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
        {tab === 0 && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              {appointmentsLoading && <Typography>Loading appointments...</Typography>}
              {appointmentsError && <Typography color="error">{appointmentsError}</Typography>}
              {!appointmentsLoading && !appointmentsError && (!appointments || appointments.length === 0) && (
                <Typography>No appointments found.</Typography>
              )}
              {!appointmentsLoading && appointments && appointments.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.map(appt => {
                        const apptDate = new Date(appt.appointmentDate);
                        return (
                          <TableRow key={appt.id}>
                            <TableCell>{appt.doctorName}</TableCell>
                            <TableCell>{apptDate.toLocaleDateString()}</TableCell>
                            <TableCell>{apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                            <TableCell>{appt.reason}</TableCell>
                            <TableCell>{appt.status}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              {vaccinesLoading && <Typography>Loading vaccines...</Typography>}
              {vaccinesError && <Typography color="error">{vaccinesError}</Typography>}
              {!vaccinesLoading && vaccines && vaccines.length === 0 && <Typography>No vaccines recorded.</Typography>}
              {!vaccinesLoading && vaccines && vaccines.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Date Administered</TableCell>
                        <TableCell>Next Dose</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vaccines.map(vac => (
                        <TableRow key={vac.id}>
                          <TableCell>{vac.name}</TableCell>
                          <TableCell>{new Date(vac.dateAdministered).toLocaleDateString()}</TableCell>
                          <TableCell>{vac.nextDose ? new Date(vac.nextDose).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography>Medical History Content</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default PatientProfileCard;
