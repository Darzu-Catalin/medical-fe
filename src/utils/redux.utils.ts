import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

export const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null)
  },
  setItem(_key: string, value: any) {
    return Promise.resolve(value)
  },
  removeItem(_key: string) {
    return Promise.resolve()
  },
})

export const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

export const createConfig = ({
  key,
  blacklist,
  whitelist,
}: {
  key: string
  blacklist?: string[]
  whitelist?: string[]
}) => {
  const futureResponse: any = {
    key,
    storage,
    version: 2,
  }

  if (blacklist) {
    futureResponse.blacklist = blacklist
  }

  if (whitelist) {
    futureResponse.whitelist = whitelist
  }

  return futureResponse
}
