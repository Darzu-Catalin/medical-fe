// utils
import axios from 'src/utils/axios'

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    // Clean token - remove extra quotes if they exist from double serialization
    let cleanToken = accessToken
    if (typeof cleanToken === 'string') {
      cleanToken = cleanToken.replace(/^"(.*)"$/, '$1')
    }
    
    localStorage.setItem('accessToken', cleanToken)
    axios.defaults.headers.common.Authorization = `Bearer ${cleanToken}`

    // Decode token to get expire time
    // Add expiredTimer to session
  } else {
    localStorage.removeItem('accessToken')

    delete axios.defaults.headers.common.Authorization
  }
}

export const getSession = () => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    // Clean token - remove extra quotes if they exist
    let cleanToken = accessToken
    if (typeof cleanToken === 'string') {
      cleanToken = cleanToken.replace(/^"(.*)"$/, '$1')
    }
    
    axios.defaults.headers.common.Authorization = `Bearer ${cleanToken}`
    return cleanToken
  } else {
    delete axios.defaults.headers.common.Authorization
    return null
  }
}
