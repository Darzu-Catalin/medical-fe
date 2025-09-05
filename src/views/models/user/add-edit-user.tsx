'use client'

import { mutate } from 'swr'
import { useMemo } from 'react'
import { FormType } from '@/types/types'
import { useRouter } from '@/routes/hooks'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { newDate } from '@/utils/datetime.utils'
import { useBoolean } from '@/hooks/use-boolean'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Iconify from '@/components/ui/minimals/iconify'
import SvgColor from '@/components/ui/minimals/svg-color'
import { date, object, string, number, boolean } from 'yup'
import { removeUnchangedFields } from '@/utils/forms.utils'
import { fDateTime, stringToDate } from '@/utils/format-time'
import { useGridContext } from '@/components/custom/grid-context'
import { upsertUserRequest } from '@/requests/admin/user.requests'
import FileFormField from '@/components/custom/forms/file-form-field'
import SubmitButtonForm from '@/components/custom/forms/submit-button'
import TextFieldsContainer from '@/components/custom/forms/text-fields-container'
import FormProvider, { RHFSwitch, RHFTextField } from '@/components/ui/minimals/hook-form'
import { formGap, formMargin, formPadding, formSpacing } from '@/components/custom/forms/constants'
import { validateNameInput, validateEmailInput, validatePhoneInput } from '@/utils/validationUtils'

import Box from '@mui/material/Box'
import { Card, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { MobileDatePicker } from '@mui/x-date-pickers'
import InputAdornment from '@mui/material/InputAdornment'

export default function AddEditUserModel({
  onSubmitSuccess,
  onSubmitError,
  updater = upsertUserRequest,
  submitButtonText,
  withProfilePicture
}: {
  onSubmitSuccess?: Function
  onSubmitError?: Function
  updater?: Function
  submitButtonText?: string
  withProfilePicture?: boolean
}) {
  const router = useRouter()
  const selectedUser = useAppSelector((state) => state.users.selectedUser)
  const password = useBoolean()
  const { params, entity } = useGridContext()

  const mode: FormType = useMemo(() => (selectedUser ? 'edit' : 'new'), [selectedUser])

  // Function that checks if the password field is required or not depending on the new/edit mode
  // If we are in edit mode we don't allow the Admin to change the password
  // Therefore we don't require the password field, and we don't display it
  const checkIfPasswordIsRequired = () => {
    if (mode === 'new') {
      return string()
        .required('E obligatoriu')
        .min(8, 'Minim 8 caractere')
        .max(20, 'Maxim 20 caractere')
    }
    return string()
  }

  // Function that checks if the firstName and lastName are required or not depending on the new/edit mode
  const checkIfNameIsRequired = (field: string) => {
    if (mode === 'new') {
      // When creating a new user we want to force the Admin to complete the firstName and lastName
      return string().required(`${field} este obligatoriu`)
    }
    // There are already user in the db that didn't complete the firstName and lastName
    // Therefore when an Admin updates the user we don't want to force him to complete the firstName and lastName
    return string()
  }

  // Validation for the forms fields
  const UserSchema = object().shape({
    file: object().shape({
      id: number().nullable(),
      url: string().nullable(),
    }),
    first_name: checkIfNameIsRequired('Prenumele'),
    last_name: checkIfNameIsRequired('Numele'),
    email: string().required('Email-ul este obligatoriu').email('Email trebuie să fie valid'),
    password: checkIfPasswordIsRequired(),
    email_verified_at: boolean(),
    promo_premium_until: date().nullable(),
    birth_date: date().nullable(),
    phone: string(),
  })

  // Default values for the forms fields
  const defaultValues = useMemo(
    () => ({
      file: selectedUser?.file || { id: null, url: null },
      first_name: selectedUser?.first_name || '',
      last_name: selectedUser?.last_name || '',
      email: selectedUser?.email || '',
      password: '',
      email_verified_at: !!selectedUser?.email_verified_at || false,
      promo_premium_until: newDate(selectedUser?.promo_premium_until) || null,
      birth_date: newDate(stringToDate(selectedUser?.birth_date)) || null,
      phone: selectedUser?.phone || '',
      avatar: selectedUser?.avatar || null,
    }),
    [selectedUser]
  )

  const methods = useForm({
    resolver: yupResolver(UserSchema) as any,
    defaultValues,
  })

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = methods

  const onSubmit = async (dataParam: any) => {
    if (!isDirty) {
      enqueueSnackbar('Nu s-a modificat nimic!', { variant: 'warning' })
      return
    }

    const data = removeUnchangedFields(dataParam, dirtyFields)

    // Format the datetime fields
    if (data.promo_premium_until) {
      data.promo_premium_until = fDateTime(data.promo_premium_until, 'yyyy-MM-dd HH:mm:ss')
    }
    if (data.birth_date) {
      data.birth_date = fDateTime(data.birth_date, 'yyyy-MM-dd HH:mm:ss')
    }

    // Format the email_verified_at field, set to null to cancel the verification
    if (data.email_verified_at === false) {
      data.email_verified_at = null
    } else if (data.email_verified_at === true) {
      // We set the email_verified_at field to the current datetime
      data.email_verified_at = fDateTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    // If we are in edit mode we add the user id to the payload and ignore the password field
    if (mode === 'edit') {
      data.id = selectedUser?.id
      delete data.password
    }

    const response = await updater(data)

    if (response.error) {
      enqueueSnackbar(response.message, { variant: 'error' })
      return
    }

    // Reset only the fields that were changed in the forms
    reset({ ...dataParam })
    await mutate(`${entity}-${JSON.stringify(params)}`)


    enqueueSnackbar(
      mode === 'new' ? 'Utilizator creat cu succes' : 'Utilizator actualizat cu succes',
      {
        variant: 'success',
      }
    )

    if (onSubmitSuccess) {
      // eslint-disable-next-line consistent-return
      return onSubmitSuccess(response.data)
    }

    router.replace(`/dashboard/user/edit/${response.data.id}`)
  }

  const renderAuthProviders = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: formMargin,
      }}
    >

      <SvgColor
        src="/assets/icons/auth_providers/ic_google.svg"
        color={selectedUser?.google_id ? 'primary.main' : 'text.disabled'}
        sx={{
          width: 20,
          height: 20,
        }}
      />

      <SvgColor
        src="/assets/icons/auth_providers/ic_facebook.svg"
        color={selectedUser?.facebook_id ? 'primary.main' : 'text.disabled'}
        sx={{
          width: 23,
          height: 23,
          mx: 5,
        }}
      />
      <SvgColor
        src="/assets/icons/auth_providers/ic_apple.svg"
        color={selectedUser?.apple_id ? 'primary.main' : 'text.disabled'}
        sx={{
          width: 21,
          height: 21,
        }}
      />
    </Box>
  )

  const renderBirthdate = (
    <Controller
      name="birth_date"
      render={({ field }) => (
        <MobileDatePicker
          format="dd/MM/yyyy"
          closeOnSelect
          maxDate={new Date()}
          label="Data nașterii"
          value={field.value}
          inputRef={field.ref}
          onChange={(dateChange) => {
            field.onChange(dateChange)
          }}
        />
      )}
    />
  )

  const renderEmailVerifiedAt = (
    <RHFSwitch
      name="email_verified_at"
      labelPlacement="start"
      label={
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Email verificat
        </Typography>
      }
      sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
    />
  )

  const renderPassword = () =>
    mode === 'new' ? (
      <RHFTextField
        name="password"
        label="Parolă"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <>
              {/* generator */}
              <InputAdornment position="end">
                <IconButton edge="end"
                  onClick={() => {
                    // generate password
                    const futurePassword = Math.random().toString(36).slice(-8) as string
                    methods.setValue('password', futurePassword, { shouldValidate: true, shouldDirty: true })

                  }}
                >
                  <Iconify icon="bi:lightbulb" />
                </IconButton>
              </InputAdornment>
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>


            </>
          ),
        }}
      />
    ) : null

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {/* BIG CONTAINER */}
      <Grid container spacing={formSpacing}>
        {/* LEFT SIDE */}
        <Grid

          display={withProfilePicture ? 'block' : 'none'}
          item xs={12} md={4}>
          <Grid container spacing={formSpacing}>
            <Grid item xs={12} md={12} gap={formGap}>
              <Card sx={{ py: 6, px: formPadding }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: formMargin,
                }}>

                  <FileFormField
                    sx={{
                      width: 100,
                      height: 100,
                    }}
                    name="avatar" type="avatar" />
                </Box>
                {mode === 'edit' && renderAuthProviders}
                {renderEmailVerifiedAt}
              </Card>
            </Grid>
          </Grid>
        </Grid>
        {/* RIGHT SIDE */}
        <Grid item xs={12} md={withProfilePicture ? 8 : 12} gap={formGap}>
          <Grid container spacing={formSpacing}>
            <Grid item xs={12} md={12} gap={formGap}>
              <Card sx={{ p: formPadding }}>
                <TextFieldsContainer>
                  <RHFTextField name="first_name" label="Prenume" inputProps={{ onInput: validateNameInput }} />
                  <RHFTextField name="last_name" label="Nume" inputProps={{ onInput: validateNameInput }} />
                  <RHFTextField name="email"
                    disabled={mode === 'edit'}
                    label="Adresa de email"
                    inputProps={{ onInput: validateEmailInput }}
                  />
                  <RHFTextField name="phone" label="Număr de telefon" inputProps={{ onInput: validatePhoneInput }} />
                  {renderPassword()}
                </TextFieldsContainer>
                <SubmitButtonForm
                  mode={mode}
                  isSubmitting={isSubmitting}
                  isDisabled={!isDirty}
                  newLabel={submitButtonText || "Adaugă"}
                  editLabel={submitButtonText || "Actualizează"}
                />
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  )
}
