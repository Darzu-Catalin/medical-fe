import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance from '@/utils/axios';
import { getSession } from '@/auth/context/utils';

// Types for appointment data
export interface AppointmentType {
  id: number;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  duration: number;
  status: number;
  reason?: string;
  notes?: string;
  createdAt: string;
}

// Status mapping for appointments
export const appointmentStatusMap: { [key: number]: { label: string; color: string; bgColor: string } } = {
  1: { label: 'Scheduled', color: '#00796b', bgColor: '#e0f7fa' },
  2: { label: 'Confirmed', color: '#1976d2', bgColor: '#e3f2fd' },
  3: { label: 'In Progress', color: '#f57c00', bgColor: '#fff3e0' },
  4: { label: 'Completed', color: '#388e3c', bgColor: '#e8f5e9' },
  5: { label: 'Cancelled', color: '#d32f2f', bgColor: '#ffebee' },
  6: { label: 'No Show', color: '#757575', bgColor: '#f5f5f5' },
};

// Calendar event interface compatible with FullCalendar
export interface CalendarAppointmentEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  className?: string[];
  extendedProps: {
    appointmentId: number;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    status: number;
    reason?: string;
    notes?: string;
    type: 'appointment';
    duration: number;
  };
}

// Fetch appointments function
const fetchAppointments = async (): Promise<AppointmentType[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await axiosInstance.get('/appointment/my', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page: 1, pageSize: 100 }, // Get more appointments for calendar
  });

  console.log('Fetched appointments for calendar:', res.data);
  return res.data?.data || [];
};

// Hook to get appointments for calendar
export const useAppointmentsForCalendar = () => {
  const { data: appointments, error, isLoading } = useSWR(
    'appointments-calendar',
    fetchAppointments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const calendarEvents = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    
    try {
      console.log('Transforming appointments to calendar events:', appointments);
      const events = transformAppointmentsToCalendarEvents(appointments);
      console.log('Generated calendar events:', events);
      return events;
    } catch (error) {
      console.error('Error transforming appointments to calendar events:', error);
      return [];
    }
  }, [appointments]);

  return {
    appointments: appointments || [],
    calendarEvents,
    appointmentsLoading: isLoading,
    appointmentsError: error,
  };
};

// Transform appointments to calendar events
const transformAppointmentsToCalendarEvents = (appointments: AppointmentType[]): CalendarAppointmentEvent[] => {
  const validEvents: CalendarAppointmentEvent[] = [];

  appointments.forEach((appointment) => {
    // Skip appointments with invalid or missing dates
    if (!appointment.appointmentDate) {
      console.warn(`Appointment ${appointment.id} has no date`);
      return;
    }

    // Handle various date formats and clean the date string
    let dateString = appointment.appointmentDate;
    if (typeof dateString === 'string') {
      // Remove any extra characters and normalize the date string
      dateString = dateString.trim();
    }

    const startDate = new Date(dateString);
    
    // Validate start date
    if (isNaN(startDate.getTime())) {
      console.warn(`Invalid appointment date for appointment ${appointment.id}:`, appointment.appointmentDate, 'Parsed as:', startDate);
      return;
    }
    
    const endDate = new Date(startDate.getTime() + (appointment.duration || 30) * 60000);
    
    // Validate end date
    if (isNaN(endDate.getTime())) {
      console.warn(`Invalid end date calculated for appointment ${appointment.id}`);
      return;
    }

    const statusInfo = appointmentStatusMap[appointment.status] || appointmentStatusMap[1];
    
    // Create detailed title with multiple lines of information
    const appointmentTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Create a more compact display format
    const title = `🏥 Dr. ${appointment.doctorName}
${appointment.specialty}
${appointment.reason || 'General Consultation'}
${statusInfo.label} • ${appointment.duration || 30}min`;

    const event: CalendarAppointmentEvent = {
      id: `appointment_${appointment.id}`,
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      backgroundColor: statusInfo.bgColor,
      borderColor: statusInfo.color,
      textColor: statusInfo.color,
      className: [
        'fc-event-appointment',
        `appointment-${statusInfo.label.toLowerCase().replace(' ', '-')}`
      ],
      extendedProps: {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        specialty: appointment.specialty,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        type: 'appointment' as const,
        duration: appointment.duration,
      },
    };

    validEvents.push(event);
  });

  return validEvents;
};// Helper to decode JWT token (copied from book-appointments)
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
};

// Check if user is doctor (for future use)
export const getUserRole = (): 'patient' | 'doctor' | null => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) return null;

  const decodedToken = decodeToken(token);
  const role = decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
               decodedToken?.role;
  
  return role === 'doctor' ? 'doctor' : 'patient';
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: number, status: number): Promise<boolean> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    await axiosInstance.put(`/appointment/${appointmentId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }
};

// Get my appointments (patient/doctor specific)
export const getMyAppointmentsRequest = async (): Promise<{ success: boolean; data?: AppointmentType[]; error?: string }> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axiosInstance.get('/appointment/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Error fetching my appointments:', error);
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
};

// Get doctor schedule (Doctor only)
export const getDoctorScheduleRequest = async (doctorId?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axiosInstance.get('/appointment/doctor/schedule', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Error fetching doctor schedule:', error);
    return { success: false, error: error.message || 'Failed to fetch schedule' };
  }
};

// Get all doctor appointments (Doctor only)
export const getAllDoctorAppointmentsRequest = async (doctorId?: string): Promise<{ success: boolean; data?: AppointmentType[]; error?: string }> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axiosInstance.get('/appointment/doctor/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
};