import React, { useState } from 'react'
import { UserType, PartnerType } from '@/types/types'
import { gridGetPartners } from '@/requests/admin/partner.requests'

import { Box, TextField, Typography, Autocomplete } from '@mui/material'

import { CustomAvatar } from '../../../components/custom/custom-avatar'
// Icons

export default function PartnerAutocomplete({
  multiple = false,
  onChange,
  value,
  label,
  disabled,
  payload,
  hardCodedFilters = [],
}: {
  multiple?: boolean
  onChange: (value: PartnerType | null) => void
  value: PartnerType | null
  label: string
  disabled?: boolean
  payload?: any
  hardCodedFilters?: Array<{
    field: string
    operator: string
    value: string | number | boolean
  }>
}) {
  const [data, setData] = useState<PartnerType[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('')

  const fetchPartners = async (input: string) => {
    setLoading(true)
    const result = await gridGetPartners({
      hardCodedFilters,
      filters: [
        {
          field: 'cif',
          value: input,
          operator: 'contains',
        },
        {
          field: 'name',
          value: input,
          operator: 'contains',
        },
      ],
      filtersOperator: 'or',
    })
    setLoading(false)
    if (result.error) {
      return
    }

    setData(result.data.data)
  }

  const renderNoOptionMessage = (): any => {
    if (userInput.length < 3) {
      return 'Minim 3 caractere'
    }
    return (
      <Box>
        <Typography variant="body2">Nu s-a găsit niciun rezultat</Typography>
      </Box>
    )
  }

  return (
    <Autocomplete
      disabled={disabled}
      multiple={multiple}
      options={data || []}
      getOptionLabel={(e: UserType) => {
        // userinput is inside e.cif
        if (e.cif.toLowerCase().includes(userInput.toLowerCase())) {
          return e.cif
        }

        // userinput is inside e.name
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
            {option.name || option.cif ? (
              <Typography variant="body2">{option.name || 'Fără nume'}</Typography>
            ) : null}
            <Typography variant="body2">{option.cif}</Typography>
          </Box>
        </Box>
      )}
      noOptionsText={<div>{renderNoOptionMessage()}</div>}
      onChange={(event: any, newValue: any) => {
        onChange(newValue)
      }}
      renderInput={(params) => <TextField {...params} label={label} value={userInput} />}
    />
  )
}
