import FullCalendar from '@fullcalendar/react'
import { CalendarPayloadType } from '@/types/types'
import { EventResizeDoneArg } from '@fullcalendar/interaction'
import { useRef, useState, useEffect, useCallback } from 'react'
import { EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core'

import { useResponsive } from 'src/hooks/use-responsive'

import { ICalendarView, ICalendarRange, ICalendarEvent, ICalendarFilters } from 'src/types/calendar'

// ----------------------------------------------------------------------

export default function useCalendar(swrPayloadParam: CalendarPayloadType) {
  const calendarRef = useRef<FullCalendar>(null)

  const calendarEl = calendarRef.current

  const smUp = useResponsive('up', 'sm')
  const [date, setDate] = useState(new Date())
  const [swrPayload, setSwrPayload] = useState<CalendarPayloadType>({
    ...swrPayloadParam,
  })

  const defaultFilters: ICalendarFilters = {
    colors: [],
    startDate: null,
    endDate: null,
  }

  const [filters, setFilters] = useState(defaultFilters)

  const [openForm, setOpenForm] = useState(false)

  const [selectEventId, setSelectEventId] = useState('')

  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null)

  const [view, setView] = useState<ICalendarView>(smUp ? 'dayGridMonth' : 'listWeek')

  useEffect(() => {
    if (calendarEl) {
      const future_view_date = {
        start: calendarEl.getApi().view.currentStart,
        end: calendarEl.getApi().view.currentEnd,
      }

      // remove 14 from start date to get the previous week and add 14 to get the next week
      future_view_date.start.setDate(future_view_date.start.getDate() - 14)
      future_view_date.end.setDate(future_view_date.end.getDate() + 14)

      setSwrPayload({
        ...swrPayload,
        view_date: future_view_date,
        filters,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, calendarEl, setSwrPayload, filters])

  const onOpenForm = useCallback(() => {
    setOpenForm(true)
  }, [])

  const onCloseForm = useCallback(() => {
    setOpenForm(false)
    setSelectedRange(null)
    setSelectEventId('')
  }, [])

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi()

      const newView = smUp ? 'dayGridMonth' : 'listWeek'
      calendarApi.changeView(newView)
      setView(newView)
    }
  }, [calendarEl, smUp])

  const onChangeView = useCallback(
    (newView: ICalendarView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi()

        calendarApi.changeView(newView)
        setView(newView)
      }
    },
    [calendarEl]
  )

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi()

      calendarApi.today()
      setDate(calendarApi.getDate())
    }
  }, [calendarEl])

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi()
      calendarApi.prev()

      setDate(calendarApi.getDate())
    }
  }, [calendarEl])

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi()
      calendarApi.next()

      setDate(calendarApi.getDate())
    }
  }, [calendarEl])

  const onSelectRange = useCallback(
    (arg: DateSelectArg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi()

        calendarApi.unselect()
      }
      onOpenForm()
      setSelectedRange({
        start: arg.start,
        end: arg.end,
      })
    },
    [calendarEl, onOpenForm]
  )

  const onClickEvent = useCallback(
    (arg: EventClickArg) => {
      const { event } = arg

      onOpenForm()
      setSelectEventId(event.id)
    },
    [onOpenForm]
  )

  const onResizeEvent = useCallback(
    (
      arg: EventResizeDoneArg,
      updateEvent: (
        eventData: Partial<ICalendarEvent>,
        swrPayloadParam: CalendarPayloadType
      ) => void
    ) => {
      const { event } = arg

      updateEvent(
        {
          id: Number(event.id),
          allDay: event.allDay,
          start: event.start as Date,
          end: event.end as Date,
        },
        swrPayload
      )
    },
    [swrPayload]
  )

  const onDropEvent = useCallback(
    (
      arg: EventDropArg,
      updateEvent: (
        eventData: Partial<ICalendarEvent>,
        swrPayloadParam: CalendarPayloadType
      ) => void
    ) => {
      const { event } = arg

      updateEvent(
        {
          id: Number(event.id),
          allDay: event.allDay,
          start: event.start as Date,
          end: event.end as Date,
        },
        swrPayload
      )
    },
    [swrPayload]
  )

  const onClickEventInFilters = useCallback(
    (eventId: string) => {
      if (eventId) {
        onOpenForm()
        setSelectEventId(eventId)
      }
    },
    [onOpenForm]
  )

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
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
    setSwrPayload,
    onClickEventInFilters,

    filters,
    setFilters,
    defaultFilters,
  }
}
