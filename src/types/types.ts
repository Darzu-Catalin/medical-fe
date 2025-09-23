import { Dispatch, SetStateAction } from 'react'
import { FileType } from '@/components/ui/minimals/upload'


export type SetValue<T> = Dispatch<SetStateAction<T>>

export type CurrentTheme = 'light' | 'dark'


export type GridSearchPayloadType = {
  id?: number
  page?: number
  per_page?: number
  filters?: Array<{
    field: string
    operator: string
    value: string | number | boolean
  }>
  hardCodedFilters?: Array<{
    field: string
    operator: string
    value: string | number | boolean
  }>
  filtersOperator?: string
  filterColumn?: string
  filterValue?: string
  slug?: string
}

export type CountryType = {
  id: number
  name: string
  code: string
}
export type CountyType = {
  id: number
  name: string
  code: string
}
export type CityType = {
  id: number
  name: string
  code: string
}

// From requests
export type FormType = 'new' | 'edit'
export interface PartnerType {
  id: number
  name: string
  country_id: string
  county_id: string
  city_id: string
  street: string
  tax: number
  street_extra: string
  administrator_email: string
  administrator_name: string
  administrator_phone: string
  bank_account: string
  type: 'provider' | 'client'
  main_company_id: number
  bank_name: string
  register_number: string
  created_at: string
  cif: string
  is_person: boolean
  is_provider: boolean
  is_client: boolean
  status: 'active' | 'inactive' | 'pending'
  deleted_at: string | null
}



export type ExternalDocumentType = {
  id: number;
  name: string;
  document_files: FileType[];
  type: string;
  notes: string;
  release_date: string;
  expiration_date: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  creator: {
    email: string;
    first_name: string;
    last_name: string;
  }
}
export interface CalendarPayloadType {
  model?: string
  id?: number
  disableCreate?: boolean
  append?: string[]
  view_date?: {
    start: Date
    end: Date
  }
  filters?: any
}

export type EventType = {
  all_day: boolean
  city_id: number
  color: string
  country_id: number
  created_at: string
  description: string
  end_date: string
  id: number
  latitude: number
  longitude: number
  model_id: number
  model_type: string
  name: string
  reminder_sent: boolean
  start_date: string
  street: string
  street_extra: string
  type: string
  updated_at: string
}

export type UserRole = 'admin' | 'doctor' | 'patient'

export interface UserType {
  id?: number | string
  email?: string
  firstName?: string
  lastName?: string
  role?: UserRole | string
  userType?: string
  type?: string
  roles?: string[]
  avatar?: {
    absolute_path: string
  }
  [key: string]: any
}


export type PermissionType = string

export interface ApiResponseType {
  error: boolean
  message: string

  [key: string]: any
}

export const ApiInitialFunction = async (payload?: any) =>
  ({
    error: true,
    message: 'Error',
  }) as ApiResponseType

export interface NotificationType {
  id: number
  user_id: number
  title: string
  body: string
  data: any
  status: 'not_read' | 'read' | 'opened'
  created_at: string
  updated_at: string
  system_data: any
  triggered_by_user: UserType | null
}

export interface ContactPersonType {
  id: number
  first_name: string
  last_name: string
  phone: string
  email: string
  user: UserType
  country_id: string
  county_id: string
  city_id: string
  street: string
  street_extra: string
  position: string
  status: string
  notes: string
  partner_id: number
  main_company_id: number
  workplace_id: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}


export interface BusinessHoursType {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export interface WorkplaceType {
  id: number
  name: string
  services_package: string
  tariff_plan: string
  partner: PartnerType
  notes: string
  latitude: number
  longitude: number
  business_hours: string
  contact_email: string
  contact_phone: string
  contact_notes: string
  calendar_appointments_enabled: boolean
  contact_url: string
  accepted_brands: string
  ranking: number
  country_id: string
  county_id: string
  city_id: string
  street: string
  street_extra: string
  status: string
  partner_id: number
  main_company_id: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}



export interface HardcodedFilter {
  field: string;
  value: string;
  operator: string;
}

export interface CampaignReciverModelType {
  [key: string]: any;
}

export interface CampaignFiltrableModelType {
  [key: string]: any;
}

export interface OrbitNotificationReceivers {
  [key: string]: any;
}


export type CustomObjectType<T = any> = { [key: string]: T }