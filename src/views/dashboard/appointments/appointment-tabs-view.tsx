'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/redux/store'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Grid,
  Stack,
  Chip,
  Button,
  Avatar,
  Pagination,
} from '@mui/material'
import {
  CalendarToday,
  Schedule,
  Person,
  LocalHospital,
  ViewModule,
} from '@mui/icons-material'
import { useAppointmentsForCalendar, AppointmentType, appointmentStatusMap } from '@/requests/appointments.requests'
import BookAppointments from '../patients/tabs/book-appointments'
import { CalendarView } from '../calendar/view'
import AppointmentStats from '@/components/custom/appointment-stats/appointment-stats';


interface AppointmentTabsProps {}

const AppointmentTabs = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const appointmentsPerPage = 6
  const { appointments = [], appointmentsLoading, appointmentsError } = useAppointmentsForCalendar()
  const { userRole } = useSelector((state: RootState) => state.auth)

  // Separate appointments into upcoming and past
  const now = new Date()
  const upcomingAppointments = appointments.filter(apt => new Date(apt.appointmentDate) > now)
  const pastAppointments = appointments.filter(apt => new Date(apt.appointmentDate) <= now)

  // Pagination logic
  const totalAppointments = appointments.length
  const totalPages = Math.ceil(totalAppointments / appointmentsPerPage)
  const startIndex = (page - 1) * appointmentsPerPage
  const paginatedUpcoming = upcomingAppointments.slice(startIndex, startIndex + Math.ceil(appointmentsPerPage / 2))
  const paginatedPast = pastAppointments.slice(startIndex, startIndex + Math.ceil(appointmentsPerPage / 2))

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(_, value) => setActiveTab(value)} 
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          },
          '& .Mui-selected': {
            color: 'primary.main',
          }
        }}
      >
        <Tab 
          icon={<CalendarToday />} 
          label="Calendar View" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        {/* <Tab 
          icon={<Schedule />} 
          label="Book Appointment" 
          iconPosition="start"
          sx={{ gap: 1 }}
        /> */}
        <Tab 
          icon={<ViewModule />} 
          label={`Appointments (${appointments.length})`} 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <CalendarView />
        </Box>
      )}

      {/* {activeTab === 1 && (
        <Box>
          <BookAppointments />
        </Box>
      )} */}

      {activeTab === 1 && (
        <Box>
<Grid item xs={1} md={12}>
                  <AppointmentStats 
                   appointments={appointments} 
                   loading={appointmentsLoading} 
                 />
                </Grid>

          {appointmentsLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 300,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography>Loading appointments...</Typography>
            </Box>
          ) : appointmentsError ? (
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'error.lighter' }}>
              <Typography color="error.main">
                Error loading appointments: {appointmentsError.message}
              </Typography>
            </Card>
          ) : (
            <>
              <Grid container spacing={3}>
                {/* Upcoming Appointments */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { boxShadow: 3 }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Schedule color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Upcoming Appointments
                        </Typography>
                        <Chip 
                          label={upcomingAppointments.length} 
                          color="primary" 
                          size="small" 
                          variant="filled"
                        />
                      </Box>

                      {paginatedUpcoming.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          bgcolor: 'action.hover',
                          borderRadius: 2 
                        }}>
                          <Schedule sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No upcoming appointments scheduled
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {paginatedUpcoming.map((appointment, index) => (
                            <Card 
                              key={index} 
                              variant="outlined" 
                              sx={{ 
                                p: 2,
                                bgcolor: 'primary.lighter',
                                borderColor: 'primary.light',
                                '&:hover': { 
                                  bgcolor: 'primary.light',
                                  transform: 'translateY(-1px)',
                                  transition: 'all 0.2s'
                                }
                              }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  <LocalHospital />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Dr. {appointment.doctorName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.specialty}
                                  </Typography>
                                  <Typography variant="body2">
                                    {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                                    {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </Typography>
                                  {appointment.reason && (
                                    <Typography variant="body2" color="text.secondary">
                                      {appointment.reason}
                                    </Typography>
                                  )}
                                </Box>
                                <Chip
                                  label={appointmentStatusMap[appointment.status]?.label || 'Unknown'}
                                  size="small"
                                  sx={{
                                    bgcolor: appointmentStatusMap[appointment.status]?.bgColor || 'grey.100',
                                    color: appointmentStatusMap[appointment.status]?.color || 'grey.700',
                                    fontWeight: 500
                                  }}
                                />
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Past Appointments */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { boxShadow: 3 }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <CalendarToday color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          Past Appointments
                        </Typography>
                        <Chip 
                          label={pastAppointments.length} 
                          color="secondary" 
                          size="small" 
                          variant="filled"
                        />
                      </Box>

                      {paginatedPast.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          bgcolor: 'action.hover',
                          borderRadius: 2 
                        }}>
                          <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No past appointments found
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {paginatedPast.map((appointment, index) => (
                            <Card 
                              key={index} 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                opacity: 0.8,
                                bgcolor: 'grey.50',
                                borderColor: 'grey.300',
                                '&:hover': { 
                                  opacity: 1,
                                  bgcolor: 'grey.100',
                                  transform: 'translateY(-1px)',
                                  transition: 'all 0.2s'
                                }
                              }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: 'grey.400' }}>
                                  <LocalHospital />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Dr. {appointment.doctorName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {appointment.specialty}
                                  </Typography>
                                  <Typography variant="body2">
                                    {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                                    {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </Typography>
                                  {appointment.reason && (
                                    <Typography variant="body2" color="text.secondary">
                                      {appointment.reason}
                                    </Typography>
                                  )}
                                </Box>
                                <Chip
                                  label={appointmentStatusMap[appointment.status]?.label || 'Unknown'}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: appointmentStatusMap[appointment.status]?.color || 'grey.400',
                                    color: appointmentStatusMap[appointment.status]?.color || 'grey.600',
                                    fontWeight: 500
                                  }}
                                />
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                
                
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 4,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontWeight: 500,
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export default AppointmentTabs