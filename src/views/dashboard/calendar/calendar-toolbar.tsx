import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/ui/minimals/iconify';
import CustomPopover, { usePopover } from 'src/components/ui/minimals/custom-popover';

import { ICalendarView } from 'src/types/calendar';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  { value: 'listWeek', label: 'List', icon: 'fluent:calendar-agenda-24-regular' },
] as const;

// ----------------------------------------------------------------------

type Props = {
  date: Date;
  view: ICalendarView;
  loading: boolean;
  onToday: VoidFunction;
  onNextDate: VoidFunction;
  onPrevDate: VoidFunction;
  onAddEvent: VoidFunction;
  onChangeView: (newView: ICalendarView) => void;
  action?: React.ReactNode;
  onRefresh?: VoidFunction;
};

export default function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  onNextDate,
  onPrevDate,
  onChangeView,
  onAddEvent,
  action,
  onRefresh,
}: Props) {
  const smUp = useResponsive('up', 'sm');

  const popover = usePopover();

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {/* Left: Add Task & Navigation */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <ButtonGroup variant="outlined" color="inherit" size="small">
            <Button startIcon={<Iconify icon="eva:plus-fill" />} onClick={onAddEvent}>Add task</Button>
          </ButtonGroup>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <IconButton onClick={onPrevDate} size="small">
            <Iconify icon="eva:arrow-ios-back-fill" width={18} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {fDate(date, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={onNextDate} size="small">
            <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
          </IconButton>
        </Stack>

        {/* Right: View Options & Filters */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {action && action}

          {onRefresh && (
            <IconButton onClick={onRefresh} size="small">
              <Iconify icon="eva:refresh-fill" />
            </IconButton>
          )}
          
          <Button 
            color="inherit" 
            size="small" 
            startIcon={<Iconify icon={selectedItem?.icon} />}
            onClick={popover.onOpen}
          >
            {selectedItem?.label}
          </Button>

          <Button 
            color="inherit" 
            size="small" 
            startIcon={<Iconify icon="eva:options-2-fill" />}
          >
            Options
          </Button>
        </Stack>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{
              height: 2,
              width: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          />
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              popover.onClose();
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
