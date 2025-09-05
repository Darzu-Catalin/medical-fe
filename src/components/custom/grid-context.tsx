import React, { useMemo, ReactNode, useContext, createContext } from 'react'

const GridContext = createContext(
  {} as {
    params: any
    setParams: any
    entity: string
  }
)

export const GridProvider = ({
  children,
  params,
  setParams,
  entity,
}: {
  children: ReactNode
  params: any
  setParams: any
  entity: string
}) => {
  const values = useMemo(() => ({ params, setParams, entity }), [params, setParams, entity])

  return <GridContext.Provider value={values}>{children}</GridContext.Provider>
}

export const useGridContext = () => useContext(GridContext)
