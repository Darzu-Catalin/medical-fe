'use client';

import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import { useEffect, useCallback, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { CalendarPayloadType } from '@/types/types';
import roLocale from '@fullcalendar/core/locales/ro';
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction';
import { useSettingsContext } from '@/components/ui/minimals/settings';
import { upsertEvent, useGetEvents } from '@/requests/admin/calendar.requests';
import { useAppointmentsForCalendar, CalendarAppointmentEvent, appointmentStatusMap } from '@/requests/appointments.requests';
import SmallModalInfoCard from '@/components/custom/small-modal-info-card/small-modal-info-card';
import AppointmentDetailDialog from '@/components/custom/appointment-detail-dialog/appointment-detail-dialog';
import AppointmentStats from '@/components/custom/appointment-stats/appointment-stats';
import AppointmentLegend from '@/components/custom/appointment-legend/appointment-legend';
import '@/styles/appointment-calendar.css';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { isAfter } from 'src/utils/format-time';

import Iconify from 'src/components/ui/minimals/iconify';

import { ICalendarFilterValue, CALENDAR_COLOR_OPTIONS } from 'src/types/calendar';

import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';
import CalendarFilters from '../calendar-filters';
import CalendarFiltersResult from '../calendar-filters-result';

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export default function CalendarView({
  model,
  append,
  disableCreate,
  id,
}: CalendarPayloadType) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const smUp = useResponsive('up', 'sm');

  const openFilters = useBoolean();

  // State for appointment detail dialog
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointmentEvent | null>(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);





  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    swrPayload,
    onClickEventInFilters,
    defaultFilters,
    filters,
    setFilters,
  } = useCalendar({
    model,
    id,
    append,
  });

  const dateError = isAfter(filters.startDate, filters.endDate);

  // Get regular calendar events
  const { events, eventsLoading } = useGetEvents(swrPayload);
  
  // Get appointments for calendar
  const { 
    calendarEvents: appointmentEvents, 
    appointments, 
    appointmentsLoading 
  } = useAppointmentsForCalendar();

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const handleFilters = useCallback((name: string, value: ICalendarFilterValue) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canReset = !!filters.colors.length || (!!filters.startDate && !!filters.endDate);

  // Combine regular events with appointment events (safely)
  const safeAppointmentEvents = Array.isArray(appointmentEvents) ? appointmentEvents : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const combinedEvents = [...safeEvents, ...safeAppointmentEvents];
  const dataFiltered = combinedEvents;

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      onFilters={handleFilters}
      //
      canReset={canReset}
      onResetFilters={handleResetFilters}
      //
      results={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointmentEvent: CalendarAppointmentEvent) => {
    setSelectedAppointment(appointmentEvent);
    setAppointmentDialogOpen(true);
  }, []);

  // Enhanced event click handler
  const handleEventClick = useCallback((info: any) => {
    // Check if clicked event is an appointment
    const eventId = info.event.id;
    if (eventId?.startsWith('appointment_')) {
      // Find the appointment event
      const appointmentEvent = appointmentEvents.find(evt => evt.id === eventId);
      if (appointmentEvent) {
        handleAppointmentClick(appointmentEvent);
        return;
      }
    }
    
    // Handle regular events (existing functionality)
    onClickEvent(info);
  }, [appointmentEvents, handleAppointmentClick, onClickEvent]);

  // Custom event content renderer for appointments
  const renderEventContent = useCallback((eventInfo: any) => {
    const event = eventInfo.event;
    const isAppointment = event.id?.startsWith('appointment_');
    
    if (!isAppointment) {
      // Return default rendering for regular events
      return null;
    }

    const extendedProps = event.extendedProps;
    if (!extendedProps) {
      // Fallback to default rendering if no extended props
      return null;
    }

    const startTime = event.start?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const statusInfo = appointmentStatusMap[extendedProps.status];
    const currentView = eventInfo.view.type;

    // Different content based on calendar view
    if (currentView === 'dayGridMonth') {
      // Compact version for month view
      return (
        <div className="appointment-event-content appointment-compact">
          <div className="appointment-doctor">
            🏥 Dr. {extendedProps.doctorName?.split(' ')[0] || 'Unknown'}
          </div>
          <div className="appointment-info">
            {extendedProps.specialty} • {statusInfo?.label}
          </div>
        </div>
      );
    }

    // Detailed version for week/day views
    return (
      <div className="appointment-event-content">
        <div className="appointment-doctor">
          🏥 Dr. {extendedProps.doctorName || 'Unknown'}
        </div>
        <div className="appointment-specialty">
          📋 {extendedProps.specialty || 'General'}
        </div>
        <div className="appointment-time">
          🕐 {startTime} ({extendedProps.duration || 30}min)
        </div>
        <div className="appointment-reason">
          📍 {extendedProps.reason || 'Consultation'}
        </div>
        <div className="appointment-status">
          📊 {statusInfo?.label || 'Scheduled'}
        </div>
      </div>
    );
  }, []);

  return (
    <>
      <Container
        sx={{
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
        }}
        maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4"> </Typography>
          <IconButton
            sx={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              zIndex: 1000,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                transform: "scale(1.2)",
                transition: "all 0.3s ease",
              },
            }}
            onClick={onOpenForm}
          >
            <Iconify
              icon="ant-design:plus"
              style={{
                width: "32px",
                height: "32px",
                color: "white"
              }}
            />
          </IconButton>
        </Stack>

        {canReset && renderResults}

        {/* Appointment Statistics */}
        <AppointmentStats 
          appointments={appointments} 
          loading={appointmentsLoading} 
        />

        {/* Appointment Legend */}
        <AppointmentLegend />

        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={eventsLoading || appointmentsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              locale={roLocale}
              weekends
              editable
              droppable={!disableCreate}
              selectable={!disableCreate}
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered as any}
              eventContent={renderEventContent}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={handleEventClick}
              height={smUp ? 720 : 'auto'}
              eventDrop={(arg) => {
                onDropEvent(arg, (eventData) => {
                  upsertEvent(eventData, swrPayload);
                });
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, (eventData) => {
                  upsertEvent(eventData, swrPayload);
                });
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
                multiMonthPlugin
              ]}
            />
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle sx={{
          minHeight: 76, display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          {openForm && <> {currentEvent?.id && currentEvent.id > 0 ? 'Modifică eveniment' : 'Adaugă eveniment'}</>}
          <SmallModalInfoCard
            model={currentEvent?.main_parent ?? null}
          />
        </DialogTitle>


        <CalendarForm
          swrPayload={swrPayload}
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
        />
      </Dialog>

      <CalendarFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        canReset={canReset}
        onResetFilters={handleResetFilters}
        //
        dateError={dateError}
        //
        events={events}
        colorOptions={CALENDAR_COLOR_OPTIONS}
        onClickEvent={onClickEventInFilters}

      />

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        open={appointmentDialogOpen}
        onClose={() => {
          setAppointmentDialogOpen(false);
          setSelectedAppointment(null);
        }}
        appointmentEvent={selectedAppointment}
      />
    </>
  );
}

// ----------------------------------------------------------------------

