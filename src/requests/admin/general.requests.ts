import axiosInstance from '@/utils/axios'
import { ApiResponse } from '@/utils/api.utils'
import { ApiResponseType, GridSearchPayloadType } from '@/types/types'

export const getModelAdminRequest = async (payload: {
  id: number
  model: string
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/admin/get-model', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}


export const gridGetLogs = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/admin/get-logs', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

type UpsertModelAdminRequestPayload = {
  id: number
  [key: string]: any
  attach?: {
    model: string
    id: number
  }
}

export const upsertModelAdminRequest = async (
  payload: UpsertModelAdminRequestPayload
): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/admin/upsert-model', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

export const deleteModelAdminRequest = async (payload: {
  id: number
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/admin/delete-model', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// get all countries
export const getCountries = async (): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/general/get-countries')

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// get all counties
export const getCounties = async (payload: { country_id: number }): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/general/get-counties', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// getCuiInfo
export const getCuiInfoRequest = async (payload: { cui: string }): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/general/get-cui-info', payload);

    return ApiResponse.success(response.data);
  } catch (error) {
    return ApiResponse.error(error);
  }
};

// gridGetForms
export const gridGetForms = async (payload: GridSearchPayloadType): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/form/get-forms', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}

// get all cities
export const getCities = async (payload: { county_id: number }): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.post('/general/get-cities', payload)

    return ApiResponse.success(response.data)
  } catch (error) {
    return ApiResponse.error(error)
  }
}



// decode address from openstreetmap nominatim
export const decodeAddressRequest = async (payload: {
  q: string;
}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        countrycodes: "ro",
        q: payload.q,
        addressdetails: 1,
      },
    });

    return ApiResponse.success(response.data);
  } catch (error) {
    return ApiResponse.error(error);
  }
};
// decode address from openstreetmap nominatim
export const reverseDecodeAddressRequest = async (payload: {
  lat: number;
  lon: number;

}): Promise<ApiResponseType> => {
  try {
    const response = await axiosInstance.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat: payload.lat,
        lon: payload.lon,
      },
    });

    return ApiResponse.success(response.data);
  } catch (error) {
    return ApiResponse.error(error);
  }
};
