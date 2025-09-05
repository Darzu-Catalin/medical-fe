import { WorkplaceType } from '@/types/types'
import React, { useState, useEffect } from 'react'
import { gridGetWorkplace } from '@/requests/admin/workplace.requests'

import { Box, TextField, Typography, Autocomplete, Select, MenuItem, FormLabel } from '@mui/material'

import { CustomAvatar } from '../../../components/custom/custom-avatar'
// Icons

export default function WorkplaceAutocomplete({
  multiple = false,
  onChange,
  value,
  label,
  disabled,
  isSelect = false,
  hardCodedFilters,
  sx,
  showFullList
}: {
  multiple?: boolean
  onChange: (value: WorkplaceType | null) => void
  value: WorkplaceType | null
  label: string
  disabled?: boolean
  hardCodedFilters?: {
    field: string
    operator: string
    value: string | number | boolean
  }[]
  sx?: any
  isSelect?: boolean
  showFullList?: boolean
}) {
  const [data, setData] = useState<WorkplaceType[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('')

  const fetchPartners = async (input: string) => {
    setLoading(true)


    const result = await gridGetWorkplace({
      filters: [
        {
          field: 'name',
          value: input,
          operator: 'contains',
        },
      ],
      filtersOperator: 'or',
      hardCodedFilters,
      // showFullList 
      ...(showFullList ? { page: 1, per_page: 10000 } : {}),
    })

    setLoading(false)

    if (result.error) {
      return
    }

    setData(result.data.data)
  }

  useEffect(() => {
    if (showFullList) {
      fetchPartners('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullList, hardCodedFilters])

  const renderNoOptionMessage = (): any => {
    if (userInput.length < 3 && !showFullList) {
      return 'Minim 3 caractere'
    }

    return (
      <Box>
        <Typography variant="body2">Nu s-a găsit niciun rezultat</Typography>
      </Box>
    )
  }


  if (isSelect) {
    return <Box sx={sx}>
    <FormLabel>{label}</FormLabel>
    <Select
      disabled={disabled}
      multiple={multiple}
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
      fullWidth
      >
      {data?.map((c: WorkplaceType) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
    </Select>
      </Box>
  }

  return (
    <Autocomplete
      sx={sx}
      disabled={disabled}
      multiple={multiple}
      getOptionKey={(option: WorkplaceType) => option.id}
      options={data || []}
      getOptionLabel={(e: WorkplaceType) => {
        // userinput is inside e.name
        if (!e.name) return ''

        if (e.name.toLowerCase().includes(userInput.toLowerCase())) {
          return e.name
        }

        return ''
      }}
      value={value}
      autoComplete
      loading={loading}
      onInputChange={async (event, newInputValue) => {
        setUserInput(newInputValue)
        if (newInputValue.length >= 3) {
          fetchPartners(newInputValue)
        }
      }}
      loadingText="Se încarcă"
      renderOption={(props, option) => (
        <Box
          component={'li' as any}
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CustomAvatar
            sx={{
              width: 40,
              height: 40,
            }}
            alt={option?.name || 'Fără nume'}
            name={option?.name || 'Fără nume'}
          />
          <Box
            sx={{
              ml: 1,
            }}
          >
            {option.name ? (
              <Typography variant="body2">{option.name || 'Fără nume'}</Typography>
            ) : null}
          </Box>
        </Box>
      )}
      noOptionsText={<div>{renderNoOptionMessage()}</div>}
      onChange={(event: any, newValue: any) => {
        onChange(newValue)
      }}
      renderInput={(params) => <TextField
        {...params} label={label} value={userInput} />}
    />
  )
}
