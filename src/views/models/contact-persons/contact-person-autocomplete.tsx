import React, { useState } from 'react'
import { UserType, ContactPersonType } from '@/types/types'
import { gridGetContactPersons } from '@/requests/admin/contact-persons.requests'

import { Box, TextField, Typography, Autocomplete } from '@mui/material'

export default function ContactPersonAutocomplete({
  multiple = false,
  onChange,
  value,
  label,
  disabled,
  payload,
}: {
  multiple?: boolean
  onChange: (value: ContactPersonType | null) => void
  value: ContactPersonType | null
  label: string
  disabled?: boolean
  payload?: any
}) {
  const [data, setData] = useState<ContactPersonType[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('')

  const fetchContactPersons = async (input: string) => {
    setLoading(true)
    const result = await gridGetContactPersons({
      filters: [
        {
          field: 'phone',
          value: input,
          operator: 'contains',
        },
      ],
      filtersOperator: 'and',
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
        if (e.number) {
          return e.number
        }

        return ''
      }}
      value={value}
      autoComplete
      loading={loading}
      onInputChange={async (event, newInputValue) => {
        setUserInput(newInputValue)
        if (newInputValue.length >= 3) {
          fetchContactPersons(newInputValue)
        }
      }}
      loadingText="Se încarcă"
      noOptionsText={<div>{renderNoOptionMessage()}</div>}
      onChange={(event: any, newValue: any) => {
        onChange(newValue)
      }}
      renderInput={(params) => <TextField {...params} label={label} value={userInput} />}
    />
  )
}
