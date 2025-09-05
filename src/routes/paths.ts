// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  APP: '/',
}

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    login: `${ROOTS.AUTH}/login`,
    register: `${ROOTS.AUTH}/register`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
    verifyEmail: `${ROOTS.AUTH}/verify-email`,
  },
  app: {
    root: ROOTS.APP,
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    user: {
      list: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/user/edit/${id}`,
    },
    client: {
      list: `${ROOTS.DASHBOARD}/client/list`,
      new: `${ROOTS.DASHBOARD}/client/new`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/client/edit/${id}`,
    },
    provider: {
      list: `${ROOTS.DASHBOARD}/provider/list`,
      new: `${ROOTS.DASHBOARD}/provider/new`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/provider/edit/${id}`,
    },
    'contact-person': {
      list: `${ROOTS.DASHBOARD}/contact-person/list`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/contact-person/edit/${id}`,
    },
    workplace: {
      list: `${ROOTS.DASHBOARD}/workplace/list`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/workplace/edit/${id}`,
    },
    calendar: {
      root: `${ROOTS.DASHBOARD}/calendar`,
    },
  },
}
