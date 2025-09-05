import { ApiResponseType } from '../types/types'

export const ApiResponse = {
  success: (response: any): ApiResponseType => response,
  error: (error: any | string): ApiResponseType => {
    // error status code
    if (error.response && error.response.status >= 500) {
      // status code
      return {
        error: true,
        message: 'A apărut o eroare! Vă rugăm reîncercați mai târziu.',
      }
    }

    return {
      error: true,
      message: typeof error === 'string' ? error : error.message,
    }
  },
}
