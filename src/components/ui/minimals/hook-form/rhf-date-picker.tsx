import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { SxProps, Theme } from '@mui/material/styles';

interface RHFDatePickerProps {
  name: string;
  label?: string;
  readOnly?: boolean;
  // Optional sx to style the internal TextField used by DatePicker
  textFieldSx?: SxProps<Theme>;
}

const RHFDatePicker: React.FC<RHFDatePickerProps> = ({ name, label, readOnly, textFieldSx }) => {
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
          sx: (theme) => ({
            '& .MuiInputBase-root': { height: '55px' },
            // Merge in optional override styles (object or function)
            ...(typeof textFieldSx === 'function'
              ? (textFieldSx as (theme: Theme) => any)(theme)
              : (textFieldSx as any)),
          }),
          inputProps: { readOnly: !!readOnly },
        },
      }}
    />
  );
};

export default RHFDatePicker;