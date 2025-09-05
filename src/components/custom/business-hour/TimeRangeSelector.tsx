import React from 'react';
import { parse, format } from 'date-fns';
import Iconify from '@/components/iconify';

import { Box, IconButton } from '@mui/material';
import { MobileTimePicker } from '@mui/x-date-pickers';


const TimeRangeSelector = ({
  label,
  time,
  onChange,
  onDelete,
  lastPeriodInSameDay,
  futurePeriodInSameDay,
}: {
  label: string;
  time: string; // 09:00 - 17:00
  onChange: any;
  onDelete: () => void;
  lastPeriodInSameDay: string;
  futurePeriodInSameDay: string;
}) => {
  const startHour = time.split('-')[0];
  const endHour = time.split('-')[1];

  return (
    <Box
      sx={{
        borderRadius: 2,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        mb: 2,
        bgcolor: 'background.neutral',
        p: 3,
        gap: 2,
        position: 'relative',
      }}
    >
      {/* delete */}
      <IconButton
        color="error"
        onClick={onDelete}
        sx={{
          bgcolor: 'error.main',
          position: 'absolute',
          top: '-16px',
          right: '-16px',
          padding: 1,
        }}
      >
        <Iconify icon="mdi:delete" color="white" />
      </IconButton>

      <MobileTimePicker
        sx={{
          width: '100%',
          border: 'none',
        }}
        minTime={lastPeriodInSameDay ? transformTime(lastPeriodInSameDay.split('-')[1]) : null}
        value={transformTime(startHour)}
        label="Incepe"
        onChange={(newValue) => {
          // if no end date set it to start date

          // get start date
          const startDate = format(newValue as any, 'HH:mm');
          const endDate = format(transformTime(endHour), 'HH:mm');

          if (startDate > endDate) {
            onChange(`${startDate}-${startDate}`);
          } else {
            onChange(`${startDate}-${endDate}`);
          }
        }}
        // AM PM
        ampm={false}
        views={['hours', 'minutes']}
      />

      <MobileTimePicker
        format="HH:mm"
        sx={{
          width: '100%',
          border: 'none',
        }}
        formatDensity="spacious"
        minTime={transformTime(startHour)}
        maxTime={futurePeriodInSameDay ? transformTime(futurePeriodInSameDay.split('-')[0]) : null}
        value={transformTime(endHour)}
        label="Termină"
        onChange={(newValue) => {
          // if no end date set it to start date

          // get start date
          const endDate = format(newValue as any, 'HH:mm');
          const startDate = format(transformTime(startHour), 'HH:mm');

          if (startDate > endDate) {
            onChange(`${endDate}-${endDate}`);
          } else {
            onChange(`${startDate}-${endDate}`);
          }
        }}
        // AM PM
        ampm={false}
        views={['hours', 'minutes']}
      />
    </Box>
  );
};

export default TimeRangeSelector;

const transformTime = (
  time: string // 09:00
) => {
  // if not valid time return current time
  if (!time) {
    time = '09:00';
  }
  const currentDate = new Date();

  return parse(time, 'HH:mm', currentDate);
};
