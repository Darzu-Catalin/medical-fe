'use client';

import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import { useEffect, useCallback } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { CalendarPayloadType } from '@/types/types';
import roLocale from '@fullcalendar/core/locales/ro';
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction';
import { useSettingsContext } from '@/components/ui/minimals/settings';
import { upsertEvent, useGetEvents } from '@/requests/admin/calendar.requests';
import SmallModalInfoCard from '@/components/custom/small-modal-info-card/small-modal-info-card';

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


  // retriggers the request when the date changes
  const { events, eventsLoading } = useGetEvents(swrPayload);

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

  const dataFiltered = events

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

        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={eventsLoading}
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
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
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
    </>
  );
}

// ----------------------------------------------------------------------

