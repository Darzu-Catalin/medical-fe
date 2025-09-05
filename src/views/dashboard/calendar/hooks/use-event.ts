import { useMemo } from 'react'
import merge from 'lodash/merge'

import { ICalendarRange, ICalendarEvent, CALENDAR_COLOR_OPTIONS } from 'src/types/calendar'

// ----------------------------------------------------------------------

export default function useEvent(
  events: ICalendarEvent[],
  selectEventId: string,
  selectedRange: ICalendarRange,
  openForm: boolean
) {
  const currentEvent = events.find((event) => event.id.toString() === selectEventId.toString())

  const defaultValues: ICalendarEvent = useMemo(
    () => ({
      id: -1,
      title: '',
      editable: true,
      description: '',
      color: CALENDAR_COLOR_OPTIONS[1],
      allDay: false,
      start: selectedRange ? selectedRange.start : new Date(),
      end: selectedRange ? selectedRange.end : new Date(),
    }),
    [selectedRange]
  )

  if (!openForm) {
    return undefined
  }

  if (currentEvent || selectedRange) {
    return merge({}, defaultValues, currentEvent)
  }

  return defaultValues
}
