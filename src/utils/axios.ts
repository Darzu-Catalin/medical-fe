import axios from 'axios'

import { HOST_API } from 'src/config-global'

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: `${HOST_API}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 1200000,
})

export default axiosInstance
