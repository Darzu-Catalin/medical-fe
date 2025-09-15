import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface RHFDatePickerProps {
  name: string;
  label?: string;
  readOnly?: boolean;
}

const RHFDatePicker: React.FC<RHFDatePickerProps> = ({ name, label, readOnly }) => {
  const { setValue, watch } = useFormContext();
  // Watch the current field value; if it's null or undefined, default to new Date()
  const value = watch(name) || new Date();

  const handleDateChange = (newValue: any) => {
    if (newValue) {
      // Create a new date with time set to start of day
      const dateOnly = new Date(newValue);
      dateOnly.setHours(0, 0, 0, 0);
      setValue(name, dateOnly);
    } else {
      setValue(name, newValue);
    }
  };

  return (
    <DatePicker
      label={label}
      format="dd-MM-yyyy"
      value={value}
      onChange={handleDateChange}
      disabled={!!readOnly}
      slotProps={{
        textField: {
          fullWidth: true,
          sx: {
            '& .MuiInputBase-root': { height: '40px' },
          },
          inputProps: { readOnly: !!readOnly },
        },
      }}
    />
  );
};

export default RHFDatePicker;