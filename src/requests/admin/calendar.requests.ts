import { clone } from 'lodash'
import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import axiosInstance from '@/utils/axios'
import { enqueueSnackbar } from 'notistack'
import { ApiResponse } from '@/utils/api.utils'
import { EventType, ApiResponseType, CalendarPayloadType } from '@/types/types'

import { ICalendarEvent } from 'src/types/calendar'

// ----------------------------------------------------------------------

const options = {
  // revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
}

const SWR_KEY_PREFIX = 'events_'

const transformEventsToICalendar = (events: EventType[]): ICalendarEvent[] =>
  events.map((event: EventType) => {
    const futureEvent = clone(event) as any
    // transform seconds timestamp to milliseconds
    // @ts-ignore
    futureEvent.end = futureEvent.end || event.end_date
    // @ts-ignore
    futureEvent.editable = !event.model_property;
    // @ts-ignore
    futureEvent.start = event.start || event.start_date
    futureEvent.allDay = event.all_day
    futureEvent.textColor = event.color
    delete futureEvent.end_date
    delete futureEvent.start_date
    delete futureEvent.all_day
    delete futureEvent.color
    
    return futureEvent
  })

const transformICalendarToEvents = (events: ICalendarEvent[]): EventType[] =>
  events.map((event: ICalendarEvent) => {
    const futureEvent = clone(event) as any

    futureEvent.end_date = event.end
    futureEvent.start_date = event.start
    futureEvent.all_day = event.allDay
    futureEvent.color = event.color
    delete futureEvent.end
    delete futureEvent.start
    delete futureEvent.allDay
    delete futureEvent.textColor

    return futureEvent
  })

// get all counties
export const getEventsRequest = async (payload: any): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('event/get-all', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export function useGetEvents(swrPayload: CalendarPayloadType) {
  const SWR_KEY = createSWRKey(swrPayload)

  const { data, isLoading, error, isValidating } = useSWR(
    SWR_KEY,
    () =>
      getEventsRequest({
        view_date: swrPayload.view_date,
        model: swrPayload.model,
        id: swrPayload.id,
        append: swrPayload.append,
        filters: swrPayload.filters,
      }) as any,
    options
  )

  const memoizedValue = useMemo(() => {
    if (!data || !data.events || !Array.isArray(data.events))
      return {
        events: [],
        eventsLoading: isLoading,
        eventsError: error,
        eventsValidating: isValidating,
        eventsEmpty: !isLoading,
      }

    const events = transformEventsToICalendar(data.events)

    return {
      events: (events as ICalendarEvent[]) || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data.events.length,
    }
  }, [data, error, isLoading, isValidating])

  return memoizedValue
}

// ----------------------------------------------------------------------

export async function upsertEvent(
  eventData: Partial<ICalendarEvent>,
  swrPayload: CalendarPayloadType
) {
  /**
   * Work on server
   */

  const data = transformICalendarToEvents([eventData as ICalendarEvent])[0]

  try {
    const response = await axiosInstance.post('/event/upsert', { ...data, aboutModel: swrPayload })

    /**
     * Work in local
     */

    const SWR_KEY = createSWRKey(swrPayload)
    // check if it's an update or a new event
    if (!eventData.id || eventData.id === -1) {
      mutate(
        SWR_KEY,
        (currentData: any) => {

          eventData.id = response.data.data.id
          const events: ICalendarEvent[] = [...currentData.events, eventData]

          return {
            ...currentData,
            events,
          }
        },
        false
      )
    } else {
      mutate(
        SWR_KEY,
        (currentData: any) => {
          // if not currentData.events, return currentData
          if (!currentData?.events) {
            return currentData
          }

          const events: ICalendarEvent[] = currentData.events.map((event: ICalendarEvent) =>
            event.id === eventData.id ? { ...event, ...eventData } : event
          )

          return {
            ...currentData,
            events,
          }
        },
        false
      )
    }

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export async function deleteEvent(eventId: number, swrPayload: CalendarPayloadType) {
  /**
   * Work on server
   */
  // const data = { eventId };
  // await axios.patch(endpoints.calendar, data);

  try {
    await axiosInstance.post('/event/delete', {
      id: eventId,
    })

    const SWR_KEY = SWR_KEY_PREFIX + JSON.stringify(swrPayload)
    mutate(
      SWR_KEY,
      (currentData: any) => {
        const events: ICalendarEvent[] = currentData.events.filter(
          (event: ICalendarEvent) => event.id !== eventId
        )
        return {
          ...currentData,
          events,
        }
      },
      false
    )
  } catch (error) {
    enqueueSnackbar('Delete failed!', { variant: 'error' })
  }
}

const createSWRKey = (swrPayload: CalendarPayloadType) =>
  SWR_KEY_PREFIX + JSON.stringify(swrPayload)
