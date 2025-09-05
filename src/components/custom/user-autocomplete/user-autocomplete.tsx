import React, { useState } from 'react'
import { UserType } from '@/types/types'
import { gridGetUsers } from '@/requests/admin/user.requests'

import { LoadingButton } from '@mui/lab'
import { Box, TextField, Typography, Autocomplete } from '@mui/material'

import { userCan, PERMISSIONS } from 'src/utils/permissions.utils'

import { CustomAvatar } from '../custom-avatar'
// Icons

export default function UserAutocomplete({
  multiple = false,
  onChange,
  value,
  label,
  disabled,
}: {
  multiple?: boolean
  onChange: (value: UserType | null) => void
  value: UserType | null
  label: string
  disabled?: boolean
  payload?: any
}) {
  const [users, setUsers] = useState<UserType[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [loadingInvite, setLoadingInvite] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('')

  const fetchUsers = async (input: string) => {
    setLoading(true)
    const result = await gridGetUsers({
      filters: [
        {
          field: 'email',
          value: input,
          operator: userCan([PERMISSIONS.ALL_PERMISSIONS]) ? 'contains' : 'equals',
        },
      ],
    })

    setLoading(false)

    if (result.error) {
      return
    }

    setUsers(result.data.data)
  }

  const renderNoOptionMessage = (): any => {
    if (userInput.length < 3) {
      return 'Minim 3 caractere'
    }

    if (!isEmailValid(userInput)) {
      return 'Invalid email'
    }

    return (
      <Box>
        <Typography>
          <b>{userInput}</b> nu se află în lista noastră de utilizatori, vrei să-l inviți?
        </Typography>
        <LoadingButton
          loading={loadingInvite}
          onClick={async () => {
            onChange({
              // @ts-ignore
              userNeedsInvite: true,
              email: userInput,
            })
            setUsers([
              {
                // @ts-ignore
                userNeedsInvite: true,
                email: userInput,
              },
            ])
          }}
          sx={{ mt: 2 }}
          size="small"
          variant="contained"
        >
          Da
        </LoadingButton>
      </Box>
    )
  }

  return (
    <Autocomplete
      disabled={disabled}
      multiple={multiple}
      options={users || []}
      getOptionLabel={(e: UserType) => {
        if (e.email) {
          return e.email
        }

        return ''
      }}
      value={value}
      autoComplete
      loading={loading}
      onInputChange={async (event, newInputValue) => {
        setUserInput(newInputValue)
        if (newInputValue.length >= 3) {
          if (userCan(['manage-users'])) {
            fetchUsers(newInputValue)
            return
          }

          // test if newInputValue is a valid email
          if (isEmailValid(newInputValue)) {
            fetchUsers(newInputValue)
          }
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
            src={option?.avatar?.absolute_path}
            alt={option?.firstName}
            name={option?.firstName}
          />
          <Box
            sx={{
              ml: 1,
            }}
          >
            {option.firstName || option.lastName ? (
              <Typography variant="body2">
                {option.firstName} {option.lastName}
              </Typography>
            ) : null}
            <Typography variant="body2">{option.email}</Typography>
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

const isEmailValid = (email: string) => {
  const REGEX_EMAIL = /\S+@\S+\.\S+/
  return REGEX_EMAIL.test(email)
}
