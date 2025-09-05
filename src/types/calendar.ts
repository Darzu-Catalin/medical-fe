// ----------------------------------------------------------------------
import { info, error, primary, success, warning, secondary } from 'src/theme/palette';

export type ICalendarFilterValue = string[] | Date | null;

export type ICalendarFilters = {
  colors: string[];
  startDate: Date | null;
  endDate: Date | null;
};

// ----------------------------------------------------------------------

export type ICalendarDate = Date;

export type ICalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' | 'multiMonthYear';

export type ICalendarRange = {
  start: ICalendarDate;
  end: ICalendarDate;
} | null;

export type ICalendarEvent = {
  id: number;
  color: string;
  title: string;
  allDay: boolean;
  editable: boolean;
  description: string;
  end: ICalendarDate;
  main_parent? : any;
  start: ICalendarDate;
};


// ----------------------------------------------------------------------

export const CALENDAR_COLOR_OPTIONS = [
  "#000000",
  primary.main,
  secondary.main,
  info.main,
  info.darker,
  success.main,
  warning.main,
  error.main,
  error.darker,
];
