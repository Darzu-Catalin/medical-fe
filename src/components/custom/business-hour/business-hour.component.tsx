/* eslint-disable radix */
import React from 'react';
import { enqueueSnackbar } from 'notistack';
import { BusinessHoursType } from '@/types/types';
import EmptyContent from '@/components/ui/minimals/empty-content/empty-content';

import { useTheme } from '@mui/system';
import { Box, Button, Typography } from '@mui/material';

import TimeRangeSelector from './TimeRangeSelector';

const translateDayToRomanian = (day: string) => {
  switch (day) {
    case 'monday':
      return 'Luni';
    case 'tuesday':
      return 'Marți';
    case 'wednesday':
      return 'Miercuri';
    case 'thursday':
      return 'Joi';
    case 'friday':
      return 'Vineri';
    case 'saturday':
      return 'Sâmbătă';
    case 'sunday':
      return 'Duminică';
    default:
      return '';
  }
};

const Day = ({
  day,
  onClick,
  selectedDay,
  hasContent,
}: {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  onClick: any;
  selectedDay: string;
  hasContent: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        padding: '4px 8px',
        backgroundColor: selectedDay === day ? theme.palette.primary.main : '',
        borderRadius: 2,
        cursor: 'pointer',
        opacity: hasContent ? 1 : 0.7,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: selectedDay === day ? '#fff' : theme.palette.text.primary,
        }}
      >
        {translateDayToRomanian(day)}
      </Typography>
    </Box>
  );
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export type DayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const BusinessHour = ({
  timetable,
  setTimetable,
  editable,
}: {
  timetable: BusinessHoursType;
  editable: boolean;
  setTimetable: (timetable: BusinessHoursType) => void;
}) => {
  const [selectedDay, setSelectedDay] = React.useState<DayType>('monday');
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {/* Left */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '120px',
            paddingRight: 2,
          }}
        >
          {(DAYS as DayType[]).map((day) => (
            <Day
              selectedDay={selectedDay}
              key={day}
              hasContent={timetable[day].length > 0}
              onClick={() => {
                setSelectedDay(day);
              }}
              day={day}
            />
          ))}
        </Box>

        {/* Right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            p: 3,
            // divider
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Make button for 24 h open */}
          {editable ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mb: 2,
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  const futureTimetable = JSON.parse(JSON.stringify(timetable));

                  futureTimetable[selectedDay] = ['00:00-23:59'];
                  setTimetable(futureTimetable);
                }}
              >
                Deschis non-stop
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  const futureTimetable = JSON.parse(JSON.stringify(timetable));
                  futureTimetable[selectedDay] = [];
                  setTimetable(futureTimetable);
                }}
              >
                Închis
              </Button>
            </Box>
          ) : null}

          {/* If not program then is closed */}
          {timetable[selectedDay].length === 0 ? (
            <EmptyContent
              sx={{
                mb: 6,
              }}
              title={`${translateDayToRomanian(selectedDay)} este închis`}
            />
          ) : null}

          {timetable &&
            timetable[selectedDay] &&
            timetable[selectedDay].map((e: string, index: number) => (
              <TimeRangeSelector
                key={index}
                label={selectedDay}
                lastPeriodInSameDay={index > 0 ? timetable[selectedDay][index - 1] : ''}
                futurePeriodInSameDay={
                  index < timetable[selectedDay].length - 1 ? timetable[selectedDay][index + 1] : ''
                }
                time={e}
                onDelete={() => {
                  // remove current index
                  const futureTimetable = JSON.parse(JSON.stringify(timetable));
                  futureTimetable[selectedDay].splice(index, 1);
                  setTimetable(futureTimetable);
                }}
                onChange={(value: string) => {
                  const futureTimetable = JSON.parse(JSON.stringify(timetable));
                  futureTimetable[selectedDay][index] = value;
                  setTimetable(futureTimetable);
                }}
              />
            ))}
          {/* Add input */}
          {editable ? (
            <Button
              variant="outlined"
              onClick={() => {
                const futureTimetable = JSON.parse(JSON.stringify(timetable));
                // if last end hour then add 1 hour to start

                if (futureTimetable[selectedDay].length === 0) {
                  futureTimetable[selectedDay].push('09:00-17:00');
                  setTimetable(futureTimetable);
                  return;
                }

                const lastPeriod =
                  futureTimetable[selectedDay][futureTimetable[selectedDay].length - 1];

                const lastPeriodEndHour = lastPeriod.split('-')[1].split(':')[0];

                const newPeriod = `${parseInt(lastPeriodEndHour) + 1}:00-${parseInt(lastPeriodEndHour) + 2
                  }:00`;

                // if error then return
                if (parseInt(lastPeriodEndHour) + 2 > 23) {
                  enqueueSnackbar('Programul depășește ziua curentă', {
                    variant: 'error',
                  });
                  return;
                }

                futureTimetable[selectedDay].push(newPeriod);
                setTimetable(futureTimetable);
              }}
            >
              Adaugă program
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessHour;
