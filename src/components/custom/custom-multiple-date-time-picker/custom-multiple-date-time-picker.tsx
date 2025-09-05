import React, { useState } from 'react'
import { fDate } from '@/utils/format-time'
import { FormLabel, IconButton, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Iconify from '@/components/iconify'
import { DateTimePicker } from '@mui/x-date-pickers'
import { onRemoveDate, processNewDate } from './utils'
import { formGap } from '../forms/constants'
import { MultipleDateTimePickerProps } from './types'

const SingleDateComponent = ({ date, onDelete }: { date: Date, onDelete: () => void }) => (
  <Stack sx={{
    flexDirection: 'row',
    padding: '10px 14px',
    alignItems: 'center',
  }}>
    <Box
      sx={{
        flex: 1,
      }}>
      <Typography sx={{
        fontSize: '0.875rem',
      }}>{fDate(date, 'dd/MM/yy HH:mm')}</Typography>
    </Box>
    <Box>
      <IconButton
        onClick={onDelete}
      >
        <Iconify icon="mdi:trash-can" />
      </IconButton>
    </Box>
  </Stack>
)

const CustomMultipleDateTimePicker = ({
  selectedDateTimeList,
  setSelectedDateTimeList
}: MultipleDateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <Box>
      <Box>
        <FormLabel sx={{
          mb: 1,
          display: "block",
        }}>Date preferate de client pentru programare {`(${(selectedDateTimeList || []).length})`}</FormLabel>
        <Box sx={{
          borderRadius: '8px',
          border: '1px solid #ddd',
          maxHeight: '168px',
          minHeight: '56px',
          overflow: 'auto'
        }}>
          {(selectedDateTimeList || []).map((date, index) => (
            <SingleDateComponent key={date.toString()} date={date} onDelete={() => {
              const newDates = onRemoveDate(selectedDateTimeList, index)
              setSelectedDateTimeList(newDates)
            }} />
          ))}
        </Box>
      </Box>

      <DateTimePicker
        disablePast
        ampm={false}
        format="dd/MM/yyyy HH:mm"
        label="Adaugă o nouă dată"
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        onAccept={(newDate) => {
          setSelectedDate(null)
          const newDates = processNewDate(selectedDateTimeList, newDate)
          setSelectedDateTimeList(newDates)
        }}
        sx={{
          marginTop: formGap,
          width: '100%'
        }}
      />
    </Box>
  )
}

export default CustomMultipleDateTimePicker