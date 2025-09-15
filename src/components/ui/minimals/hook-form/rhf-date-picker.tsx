import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface RHFDatePickerProps {
  name: string;
  label?: string;
  readOnly?: boolean;
}

// Helpers to convert between string dd-MM-yyyy and Date
const toDdMmYyyy = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const parseFromString = (value?: string | null): Date | null => {
  if (!value) return null;
  // Try dd-MM-yyyy
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (ddmmyyyy.test(value)) {
    const [, dd, mm, yyyy] = value.match(ddmmyyyy)!;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (yyyymmdd.test(value)) {
    const [, yyyy, mm, dd] = value.match(yyyymmdd)!;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Try ISO
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const RHFDatePicker: React.FC<RHFDatePickerProps> = ({ name, label, readOnly }) => {
  const { setValue, watch } = useFormContext();
  // We store the form value as a dd-MM-yyyy string (or undefined)
  const rawValue = watch(name) as string | Date | null | undefined;

  // Convert stored value to Date for the picker
  const pickerValue: Date | null = (() => {
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue === 'string') return parseFromString(rawValue);
    return null;
  })();

  const handleDateChange = (newValue: Date | null) => {
    if (newValue instanceof Date && !Number.isNaN(newValue.getTime())) {
      const normalized = new Date(newValue);
      normalized.setHours(0, 0, 0, 0);
      const formatted = toDdMmYyyy(normalized);
      setValue(name, formatted, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    } else {
      setValue(name, undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  };

  return (
    <DatePicker
      label={label}
      format="dd-MM-yyyy"
  value={pickerValue}
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