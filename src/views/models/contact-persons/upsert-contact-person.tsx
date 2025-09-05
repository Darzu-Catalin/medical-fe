/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { mutate } from 'swr'
import { object, string } from 'yup'
import { FormType } from '@/types/types'
import { useForm } from 'react-hook-form'
import { useMemo, useEffect } from 'react'
import { useRouter } from '@/routes/hooks'
import { enqueueSnackbar } from 'notistack'
import { useAppSelector } from '@/redux/store'
import { yupResolver } from '@hookform/resolvers/yup'
import Address from '@/components/custom/address/address'
import { removeUnchangedFields } from '@/utils/forms.utils'
import { useGridContext } from '@/components/custom/grid-context'
import SubmitButtonForm from '@/components/custom/forms/submit-button'
import { formGap, formSpacing } from '@/components/custom/forms/constants'
import { upsertContactPersons } from '@/requests/admin/contact-persons.requests'
import TextFieldsContainer from '@/components/custom/forms/text-fields-container'
import FormProvider, { RHFTextField, RHFAutocomplete } from '@/components/ui/minimals/hook-form'
import { validateNameInput, validateEmailInput, validatePhoneInput } from '@/utils/validationUtils'

import { Grid, Typography } from '@mui/material'

const STATUS_OPTIONS = [
  { label: 'Activ', value: 'active' },
  { label: 'Inactiv', value: 'inactive' },
  { label: 'Șters', value: 'deleted' },
  { label: 'Plecat/ă din companie', value: 'out of office' },
  { label: 'Rezervă', value: 'reserve' },
]


const POSITION_OPTIONS = [
  { label: 'Manager', value: "manager" },
  { label: 'Contabil', value: "contabil" },
]
interface StatusType {
  label: string
  value: string
}
export default function AddEditContactPersonModel({
  onSubmitSuccess,
  onSubmitError,
  updater = upsertContactPersons,
}: {
  onSubmitSuccess?: Function
  onSubmitError?: Function
  updater?: Function
}) {
  const router = useRouter()
  const model = useAppSelector((state) => state.general.selectedContactPerson)
  const mode: FormType = useMemo(() => (model ? 'edit' : 'new'), [model])
  const { params, entity } = useGridContext()

  // Validation for the forms fields
  const modelSchema = object().shape({
    first_name: string().required('Numele este obligatoriu'),
    last_name: string().required('Prenumele este obligatoriu'),
    phone: string().required('Numărul de telefon este obligatoriu'),
    email: string().email('Email-ul nu este valid').required('Email-ul este obligatoriu'),
    position: string(),
    status: string().required('Statusul este obligatoriu'),
    notes: string()
  })

  // Default values for the forms fields
  const defaultValues = useMemo(
    () => ({
      first_name: model?.first_name || '',
      last_name: model?.last_name || '',
      phone: model?.phone || '',
      email: model?.email || '',
      country_id: model?.country_id || '',
      county_id: model?.county_id || '',
      city_id: model?.city_id || '',
      street: model?.street || '',
      street_extra: model?.street_extra || '',
      position: model?.position || '',
      status: model?.status || '',
      notes: model?.notes || '',
    }),
    [model]
  )

  const methods = useForm({
    resolver: yupResolver(modelSchema),
    defaultValues,
  })

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isDirty, dirtyFields },
  } = methods

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const onSubmit = async (dataParam: any) => {
    if (!isDirty) {
      enqueueSnackbar('Nu s-a modificat nimic!', { variant: 'warning' })
      return
    }

    const data = removeUnchangedFields(dataParam, dirtyFields)

    // If we are in edit mode we add the user id to the payload and ignore the password field
    if (mode === 'edit') {
      data.id = model?.id
    }

    const response = await updater(data)

    if (response.error) {
      enqueueSnackbar(response.message, { variant: 'error' })
      return
    }

    // Reset only the fields that were changed in the forms
    reset({ ...dataParam })

    await mutate(`${entity}-${JSON.stringify(params)}`)
    enqueueSnackbar(mode === 'new' ? 'Datele au fost create ' : 'Datele au fost actualizate', {
      variant: 'success',
    })

    if (onSubmitSuccess) {
      // eslint-disable-next-line consistent-return
      return onSubmitSuccess(response.data)
    }
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {/* BIG CONTAINER */}
      <Grid container spacing={formSpacing}>
        {/* LEFT SIDE */}
        {/* RIGHT SIDE */}
        <Grid item xs={12} md={12} gap={formGap}>
          <Grid container spacing={formSpacing}>
            <Grid item xs={12} md={12} gap={formGap}>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.7 }}>
                General {model?.id ? `#${model?.id}` : ''}
              </Typography>
              <TextFieldsContainer>
                <RHFTextField name="first_name" label="Prenume" inputProps={{ onInput: validateNameInput }} />
                <RHFTextField name="last_name" label="Nume" inputProps={{ onInput: validateNameInput }} />
                <RHFTextField name="phone" label="Număr de telefon" inputProps={{ onInput: validatePhoneInput }} />
                <RHFTextField name="email" type="email" label="Email" inputProps={{ onInput: validateEmailInput }} />

                <RHFAutocomplete
                  options={POSITION_OPTIONS}
                  value={POSITION_OPTIONS.find((option) => option.value === watch('position')) || null}
                  name="position" label="Poziție"
                  onChange={(e, newValue) => {
                    const typedValue = newValue as StatusType
                    setValue('position', typedValue?.value || '', { shouldDirty: true })
                  }}
                />
                <RHFAutocomplete
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  onChange={(e, newValue) => {
                    const typedValue = newValue as StatusType
                    setValue('status' as any, typedValue?.value || '', { shouldDirty: true })
                  }}
                  value={STATUS_OPTIONS.find((option) => option.value === watch('status')) || null}
                />

              </TextFieldsContainer>

              <RHFTextField
                sx={{
                  mt: 2,
                  mb: 2,
                }}
                multiline
                name="notes" label="Observații" />

              <Typography variant="body1" sx={{ mb: 3, mt: 3, opacity: 0.7 }}>
                Adresă
              </Typography>
              <Address
                sx={{
                  mt: 3,
                  mb: 3,
                }}
                city_id={watch('city_id' as any)}
                county_id={watch('county_id' as any)}
                country_id={watch('country_id' as any)}
                street={watch('street' as any)}
                street_extra={watch('street_extra' as any)}
                onChange={(e) => {
                  methods.setValue('city_id' as any, e.city_id, { shouldDirty: true })
                  methods.setValue('county_id' as any, e.county_id, { shouldDirty: true })
                  methods.setValue('country_id' as any, e.country_id, { shouldDirty: true })
                  methods.setValue('street' as any, e.street, { shouldDirty: true })
                  methods.setValue('street_extra' as any, e.street_extra, { shouldDirty: true })
                }}
              />

              <SubmitButtonForm
                mode={mode}
                isSubmitting={isSubmitting}
                isDisabled={!isDirty}
                newLabel="Creează"
                editLabel="Actualizează"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  )
}
