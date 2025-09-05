// utils
import axios from 'src/utils/axios'

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('orbit_accessToken', accessToken)

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`

    // Decode token to get expire time
    // Add expiredTimer to session
  } else {
    localStorage.removeItem('orbit_accessToken')

    delete axios.defaults.headers.common.Authorization
  }
}

export const getSession = () => {
  const accessToken = localStorage.getItem('orbit_accessToken')

  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    delete axios.defaults.headers.common.Authorization
  }

  return accessToken
}
