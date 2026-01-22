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

// Doctor type from API
export interface DoctorType {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email?: string;
  phone?: string;
}

// Calendar event from API
export interface CalendarEventFromAPI {
  id: number;
  title?: string;
  start: string;
  end: string;
  allDay?: boolean;
  doctorId?: string;
  patientId?: string;
  doctorName?: string;
  patientName?: string;
  specialty?: string;
  status?: number;
  reason?: string;
  notes?: string;
  duration?: number;
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

// ============================================
// Calendar API Functions (NEW ENDPOINTS)
// ============================================

// Fetch calendar events for authenticated user (auto-filters by role)
const fetchCalendarEvents = async (): Promise<CalendarEventFromAPI[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Calendar/my', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Fetched calendar events:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

// Fetch all calendar events with optional filters
export const fetchAllCalendarEvents = async (params?: {
  start?: string;
  end?: string;
  doctorId?: string;
  patientId?: string;
  status?: number;
}): Promise<CalendarEventFromAPI[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Calendar', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    console.log('Fetched all calendar events:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching all calendar events:', error);
    return [];
  }
};

// Fetch calendar events for a specific day
export const fetchCalendarEventsForDay = async (date: string): Promise<CalendarEventFromAPI[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Calendar/day', {
      headers: { Authorization: `Bearer ${token}` },
      params: { date },
    });

    console.log('Fetched calendar events for day:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching calendar events for day:', error);
    return [];
  }
};

// Fetch calendar events for a specific week
export const fetchCalendarEventsForWeek = async (date: string): Promise<CalendarEventFromAPI[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Calendar/week', {
      headers: { Authorization: `Bearer ${token}` },
      params: { date },
    });

    console.log('Fetched calendar events for week:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching calendar events for week:', error);
    return [];
  }
};

// Fetch available time slots for a doctor
export const fetchDoctorAvailability = async (doctorId: string, date: string): Promise<string[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Calendar/availability', {
      headers: { Authorization: `Bearer ${token}` },
      params: { doctorId, date },
    });

    console.log('Fetched doctor availability:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return [];
  }
};

// ============================================
// Doctor API Functions
// ============================================

// Fetch all doctors
export const fetchDoctors = async (): Promise<DoctorType[]> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return [];
  }

  try {
    const res = await axiosInstance.get('/Doctor', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Fetched doctors:', res.data);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// Hook to get doctors
export const useGetDoctors = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'doctors-list',
    fetchDoctors,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    doctors: data || [],
    doctorsLoading: isLoading,
    doctorsError: error,
    refreshDoctors: mutate,
  };
};

// ============================================
// Appointment Creation/Update Functions
// ============================================

// Create a new appointment via API
export const createAppointmentRequest = async (appointmentData: {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  duration: number;
  reason?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = getSession() || localStorage.getItem('token');
  if (!token) {
    return { success: false, error: 'No authentication token found' };
  }

  try {
    // Transform to match API expectations (PatientId with capital P)
    const payload = {
      PatientId: appointmentData.patientId,
      DoctorId: appointmentData.doctorId,
      AppointmentDate: appointmentData.appointmentDate,
      Duration: appointmentData.duration,
      Reason: appointmentData.reason || '',
      Notes: appointmentData.notes || '',
    };

    const res = await axiosInstance.post('/appointment', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Created appointment:', res.data);
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to create appointment' };
  }
};

// Hook to get appointments for calendar (using new Calendar API)
export const useAppointmentsForCalendar = () => {
  const { data: calendarData, error, isLoading, mutate: mutateCalendar } = useSWR(
    'calendar-events-my',
    fetchCalendarEvents,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Normalize calendar data to always be an array
  const normalizedCalendarData = useMemo((): CalendarEventFromAPI[] => {
    if (!calendarData) return [];
    
    // If it's already an array, use it directly
    if (Array.isArray(calendarData)) return calendarData as CalendarEventFromAPI[];
    
    // If it has a data property that's an array, use that
    if ((calendarData as any).data && Array.isArray((calendarData as any).data)) {
      return (calendarData as any).data as CalendarEventFromAPI[];
    }
    
    // If it has an events property that's an array, use that
    if ((calendarData as any).events && Array.isArray((calendarData as any).events)) {
      return (calendarData as any).events as CalendarEventFromAPI[];
    }
    
    // If it has an items property that's an array, use that
    if ((calendarData as any).items && Array.isArray((calendarData as any).items)) {
      return (calendarData as any).items as CalendarEventFromAPI[];
    }
    
    // If it's an object but not an array, wrap it in an array
    if (typeof calendarData === 'object') {
      console.warn('Calendar data is an object, not an array:', calendarData);
      return [];
    }
    
    return [];
  }, [calendarData]);

  const calendarEvents = useMemo(() => {
    if (!normalizedCalendarData || normalizedCalendarData.length === 0) {
      console.log('No calendar events found from API');
      return [];
    }
    
    try {
      console.log('Transforming calendar events:', normalizedCalendarData);
      const events = transformCalendarEventsToFullCalendar(normalizedCalendarData);
      console.log('Generated FullCalendar events:', events);
      return events;
    } catch (err) {
      console.error('Error transforming calendar events:', err);
      return [];
    }
  }, [normalizedCalendarData]);

  // Convert to AppointmentType for compatibility with existing components
  const appointments: AppointmentType[] = useMemo(() => {
    if (!normalizedCalendarData || normalizedCalendarData.length === 0) return [];
    
    return normalizedCalendarData.map(event => ({
      id: event.id,
      patientId: event.patientId || '',
      doctorId: event.doctorId || '',
      patientName: event.patientName || '',
      doctorName: event.doctorName || '',
      specialty: event.specialty || '',
      appointmentDate: event.start,
      duration: event.duration || 30,
      status: event.status || 1,
      reason: event.reason,
      notes: event.notes,
      createdAt: event.start,
    }));
  }, [normalizedCalendarData]);

  // Function to add a new appointment via API
  const addAppointment = async (appointmentData: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    duration: number;
    reason?: string;
    notes?: string;
  }) => {
    const result = await createAppointmentRequest(appointmentData);
    if (result.success) {
      // Refresh calendar data
      mutateCalendar();
    }
    return result;
  };

  return {
    appointments,
    calendarEvents,
    appointmentsLoading: isLoading,
    appointmentsError: error,
    addAppointment,
    refreshAppointments: mutateCalendar,
  };
};

// Transform API calendar events to FullCalendar format
const transformCalendarEventsToFullCalendar = (events: CalendarEventFromAPI[]): CalendarAppointmentEvent[] => {
  const validEvents: CalendarAppointmentEvent[] = [];

  events.forEach((event) => {
    if (!event.start) {
      console.warn(`Event ${event.id} has no start date`);
      return;
    }

    const startDate = new Date(event.start);
    if (isNaN(startDate.getTime())) {
      console.warn(`Invalid start date for event ${event.id}:`, event.start);
      return;
    }
    
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + (event.duration || 30) * 60000);
    if (isNaN(endDate.getTime())) {
      console.warn(`Invalid end date for event ${event.id}`);
      return;
    }

    const status = event.status || 1;
    const statusInfo = appointmentStatusMap[status] || appointmentStatusMap[1];
    const duration = event.duration || Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    
    // Create title from event data
    const doctorName = event.doctorName || 'Unknown Doctor';
    const specialty = event.specialty || 'General';
    const reason = event.reason || 'Consultation';
    
    const title = event.title || `🏥 Dr. ${doctorName}
${specialty}
${reason}
${statusInfo.label} • ${duration}min`;

    const calendarEvent: CalendarAppointmentEvent = {
      id: `appointment_${event.id}`,
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: event.allDay || false,
      backgroundColor: statusInfo.bgColor,
      borderColor: statusInfo.color,
      textColor: statusInfo.color,
      className: [
        'fc-event-appointment',
        `appointment-${statusInfo.label.toLowerCase().replace(' ', '-')}`
      ],
      extendedProps: {
        appointmentId: event.id,
        patientId: event.patientId || '',
        doctorId: event.doctorId || '',
        patientName: event.patientName || '',
        doctorName: doctorName,
        specialty: specialty,
        status: status,
        reason: event.reason,
        notes: event.notes,
        type: 'appointment' as const,
        duration: duration,
      },
    };

    validEvents.push(calendarEvent);
  });

  return validEvents;
};

// Helper to decode JWT token
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

// Check if user is doctor
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

    const response = await axiosInstance.get('/Calendar/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return { success: true, data: response.data?.data || response.data };
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

    const response = await axiosInstance.get('/Calendar/availability', {
      headers: { Authorization: `Bearer ${token}` },
      params: doctorId ? { doctorId } : undefined
    });

    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error fetching doctor schedule:', error);
    return { success: false, error: error.message || 'Failed to fetch schedule' };
  }
};

// Get all doctor appointments (Doctor only)
export const getAllDoctorAppointmentsRequest = async (params?: { 
  start?: string; 
  end?: string; 
  doctorId?: string 
}): Promise<{ success: boolean; data?: CalendarEventFromAPI[]; error?: string }> => {
  try {
    const token = getSession() || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axiosInstance.get('/Calendar', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
};