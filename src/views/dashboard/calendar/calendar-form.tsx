import * as Yup from 'yup';
import { useState, useCallback } from 'react';
import { CalendarPayloadType } from '@/types/types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { deleteEvent, upsertEvent } from '@/requests/admin/calendar.requests';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { isAfter } from 'src/utils/format-time';

import Iconify from 'src/components/ui/minimals/iconify';
import { useSnackbar } from 'src/components/ui/minimals/snackbar';
import { ColorPicker } from 'src/components/ui/minimals/color-utils';
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/ui/minimals/hook-form';

import { ICalendarDate, ICalendarEvent } from 'src/types/calendar';


// ----------------------------------------------------------------------

type Props = {
  colorOptions: string[];
  onClose: VoidFunction;
  currentEvent?: ICalendarEvent;
  swrPayload: CalendarPayloadType
};

export default function CalendarForm({ currentEvent, colorOptions, onClose, swrPayload }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    // not required
    color: Yup.string(),
    allDay: Yup.boolean(),
    start: Yup.mixed(),
    end: Yup.mixed(),
  });

  const [deleteIsLoading, setDeleteIsLoading] = useState(false);

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: currentEvent,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = isAfter(values.start, values.end);

  const onSubmit = handleSubmit(async (data) => {

    if (!currentEvent?.editable) {
      enqueueSnackbar('You do not have permission to edit this event', { variant: 'error' });
      return;
    }

    const eventData: ICalendarEvent = {
      id: currentEvent?.id ? Number(currentEvent?.id) : -1,
      color: data?.color,
      title: data?.title,
      allDay: data?.allDay,
      description: data?.description,
      end: data?.end,
      start: data?.start,
    } as ICalendarEvent;

    try {
      if (!dateError) {
        const response = await upsertEvent(eventData, swrPayload);

        if (response.error) {
          enqueueSnackbar(response.message, { variant: 'error' });
          return;
        }

        onClose();
        enqueueSnackbar('Eveniment salvat!');
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onDelete = useCallback(async () => {

    if (!currentEvent?.editable) {
      enqueueSnackbar('You do not have permission to delete this event', { variant: 'error' });
      return;
    }


    try {
      setDeleteIsLoading(true);
      await deleteEvent(currentEvent?.id || -1, swrPayload);
      setDeleteIsLoading(false);
      enqueueSnackbar('Delete success!');
      onClose();
    } catch (error) {
      setDeleteIsLoading(false);
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent?.id, enqueueSnackbar, onClose, swrPayload]);

  return (
    <FormProvider
      methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{
        px: 3,
        opacity: currentEvent?.editable ? 1 : 0.8,
        pointerEvents: currentEvent?.editable ? 'auto' : 'none',
      }}>
        <RHFTextField
          name="title" label="Titlu" />

        <RHFTextField
          name="description" label="Descriere" multiline rows={3} />

        <RHFSwitch
          name="allDay" label="Toată ziua" />

        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={new Date(field.value as ICalendarDate)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(newValue);
                }
              }}
              ampm={false}
              label="De la"
              format="dd/MM/yyyy HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          )}
        />

        <Controller
          name="end"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              ampm={false}
              value={new Date(field.value as ICalendarDate)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(newValue);
                }
              }}
              label="Până la"
              format="dd/MM/yyyy HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: dateError,
                  helperText: dateError && 'End date must be later than start date',
                },
              }}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorPicker
              disabled={!currentEvent?.editable}
              selected={field.value as string}
              onSelectColor={(color) => field.onChange(color as string)}
              colors={colorOptions}
            />
          )}
        />
      </Stack>

      {currentEvent?.editable ? <DialogActions>
        {!!currentEvent?.id && currentEvent.id > 0 && (
          <Tooltip title="Delete Event">
            <IconButton onClick={onDelete}>
              {deleteIsLoading ? (
                <Iconify icon="line-md:loading-loop" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" />
              )}
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Anulează
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
          Salvează
        </LoadingButton>
      </DialogActions> : <DialogActions />}
    </FormProvider>
  );
}
