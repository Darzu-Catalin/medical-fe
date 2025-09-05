'use client'

import useSWR from 'swr'
import { enqueueSnackbar } from 'notistack'
import Iconify from '@/components/ui/minimals/iconify'
import { useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react'

import { Box, Button, IconButton, Typography, CircularProgress, Dialog } from '@mui/material'
import {
  GridColDef,
  GridSortModel,
  useGridApiRef,
  GridFilterModel,
  GridInitialState,
  GridPaginationModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
  DataGridPro as DataGrid,
  GridToolbarColumnsButton,
  GridColumnVisibilityModel,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro'

import { GridProvider } from './grid-context'
import EmptyContent from '../ui/minimals/empty-content/empty-content'

type Props = {
  fetcher: Function | null
  columns: GridColDef[]
  selectable?: boolean
  hasExport?: boolean
  onChangeParams?: Function
  rightComponent?: React.ReactNode
  hardCodedFilters?: any[]
  entityName: string
  autoHeight?: boolean
  canClickOnSelectedButton?: boolean
  onSelectionChange?: Function
  disabledSelectedEntities?: number[]
  withLocalstorage?: boolean
  defaultFilters?: any[]
  refetchInterval?: number
  onFetchFinished?: Function
  duplicateKey?: string,
  extraParams?: any
  dataGridProps?: any
  onSwrKeyChange?: Function
}

export default function OrbitDataGrid({
  disabledSelectedEntities,
  duplicateKey,
  columns,
  fetcher,
  selectable = false,
  hasExport = false,
  onChangeParams,
  rightComponent,
  hardCodedFilters = [],
  entityName,
  autoHeight = true,
  canClickOnSelectedButton = true,
  onSelectionChange,
  withLocalstorage = true,
  defaultFilters = [],
  refetchInterval,
  extraParams,
  onFetchFinished,
  onSwrKeyChange,
  ...dataGridProps
}: Props) {
  const [totalItems, setTotalItems] = useState(0)
  const [params, setParams] = useState<any>({
    page: 0,
    per_page: 25,
    order: null,
    filters: defaultFilters,
  })
  const apiRef = useGridApiRef()
  const [pathsToDownload, setPathsToDownload] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const [initialState, setInitialState] = useState<GridInitialState>()
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
  })
  const saveSnapshot = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage && withLocalstorage) {
      const currentState = apiRef.current.exportState()
      localStorage.setItem(`${entityName}-dataGridState`, JSON.stringify(currentState))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRef, entityName, withLocalstorage])


  const formatedColumns = useMemo(() => {

    if (!hardCodedFilters || !hardCodedFilters.length) {
      return columns
    }

    const newColumns = columns.map((column) => {
      // if inside hardCodedFilters there is a filter for this column, set filterable to false
      // @ts-ignore
      const isFilterable = !hardCodedFilters.find((filter) => filter.field === column.field)
      return {
        ...column,
        filterable: isFilterable,
      }
    }
    )

    return newColumns
  }, [columns, hardCodedFilters])


  const [selected, setSelected] = useState<any[]>(disabledSelectedEntities || [])

  useEffect(() => {
    if (onChangeParams) {
      onChangeParams(params)
    }
    getDataAsync()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  useLayoutEffect(() => {
    const stateFromLocalStorage = withLocalstorage ? localStorage?.getItem(`${entityName}-dataGridState`) : null
    setInitialState(stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {
      pagination: {
        paginationModel: {
          page: 0,
          pageSize: 25,
        },
      },
      filter: {
        filterModel: {
          items: defaultFilters || [],
          logicOperator: 'and',
        },
      },
    })
    // handle refresh and navigating away/refreshing
    window.addEventListener('beforeunload', saveSnapshot)

    return () => {
      // in case of an SPA remove the event-listener
      window.removeEventListener('beforeunload', saveSnapshot)
      saveSnapshot()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityName, saveSnapshot, withLocalstorage])

  const swrKey = `${entityName}-${JSON.stringify(params)}`;


  useEffect(() => {
    if (onSwrKeyChange) {
      onSwrKeyChange(swrKey)
    }
  }, [onSwrKeyChange, swrKey])

  const { data, isLoading } = useSWR(
    swrKey,
    () => {
      if (!initialState || !fetcher) {
        return false
      }

      localStorage.setItem(`${entityName}-swr-key`, swrKey)

      return fetcher(
        addHardCodedFilterToParams(
          {
            ...params,
            page: params.page + 1,
          },
          hardCodedFilters,
          extraParams
        )
      )
    },
    {
      onSuccess: (e) => {
        if (onFetchFinished) {
          onFetchFinished(e)
        }
      },
      refreshInterval: refetchInterval,
    }
  )

  useEffect(() => {
    if (!data) {
      return () => { }
    }
    if (data?.error) {
      enqueueSnackbar(data.message, { variant: 'error' })
      return () => { }
    }
    setTotalItems(data.data.total)

    return () => { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, params])

  const handleFilterChange = (model: GridFilterModel) => {
    // If there is no filter applied, set the filter to empty

    if (!model.items.length) {
      setParams({
        ...params,
        filters: null,
      })
      return
    }

    // if field is empty or only one filter and filtersOperator is or, set the filtersOperator to and
    if (model.items.length === 1 && model.logicOperator === 'or') {
      // @ts-ignore
      model.logicOperator = 'and'
    }

    const futureParams = {
      ...params,
      filtersOperator: model.logicOperator,
      filters: [
        ...model.items.map((item) => ({
          field: item.field,
          operator: item.operator,
          value: item.value,
        })),
      ],
      page: 0,
    }
    setParams(futureParams)
  }

  const handleSortChange = (model: GridSortModel) => {
    // If there is no sort applied, set the order to empty
    if (!model.length) {
      setParams({
        ...params,
        order: null,
      })
      return
    }

    const futureParams = {
      ...params,
      order: `${model[0].field}: ${model[0].sort}`,
      page: 0,
    }
    setParams(futureParams)
  }

  const getDataAsync = async (payload?: { export?: boolean }) => {
    if (!fetcher) {
      return
    }
    setLoading(true)

    const response = await fetcher(
      addHardCodedFilterToParams(
        {
          ...params,
          page: params.page + 1,
          export: payload?.export,
          columns: formatedColumns,
          columnVisibilityModel
        },
        hardCodedFilters,
        extraParams
      )
    )


    setLoading(false)

    if (response.error) {
      enqueueSnackbar(response.message, { variant: 'error' })
      return
    }

    if (onFetchFinished) {
      onFetchFinished(response)
    }

    if (payload?.export) {
      // The response is a excel file
      // Get path from response and open it in new tab
      const urls = response.paths
      setPathsToDownload(urls)
      return;
    }

    setTotalItems(response.data.total)
  }

  const handlePaginationChange = (model: GridPaginationModel) => {
    // If we use pagination we set the new page
    setParams({
      ...params,
      page: model.page,
      per_page: model.pageSize,
    })
  }


  const rows = useMemo(() => {


    const original = data?.data?.data || [];
    const rowsSorted = {} as any
    const duplicateRows = [] as any
    const toReturn = [] as any

    if (duplicateKey) {

      original.forEach((row: any) => {
        if (rowsSorted[row[duplicateKey]]) {
          rowsSorted[row[duplicateKey]].push(row)
        } else {
          rowsSorted[row[duplicateKey]] = [row]
        }
      });


      Object.keys(rowsSorted).forEach((key) => {
        if (rowsSorted[key].length > 1) {
          rowsSorted[key].forEach((row: any, index: number) => {
            duplicateRows.push({
              ...row,
              duplicated: true
            })
          });


        } else {
          toReturn.push(rowsSorted[key][0])
        }

      })
    }

    return duplicateKey ? [...duplicateRows, ...toReturn] : original
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Set the states from the initial state
  useEffect(() => {
    if (!initialState) {
      return () => { }
    }

    const futureParams = {
      ...params,
      page: initialState?.pagination?.paginationModel?.page || 0,
      per_page: initialState?.pagination?.paginationModel?.pageSize || 25,
      // @ts-ignore
      order: initialState?.sorting?.[0]?.field
        ? // @ts-ignore
        `${initialState?.sorting?.[0]?.field}: ${initialState?.sorting?.[0]?.sort}`
        : null,
      filters: initialState?.filter?.filterModel?.items.length
        ? [
          ...defaultFilters,
          // eslint-disable-next-line no-unsafe-optional-chaining
          ...initialState?.filter?.filterModel?.items.map((item) => ({
            field: item.field,
            operator: item.operator,
            value: item.value,
          })),
        ]
        : null,
    }

    setParams(futureParams)
    return () => { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialState])

  if (!initialState) {
    return <CircularProgress />
  }

  return (
    <GridProvider setParams={setParams} entity={entityName} params={params}>

      {pathsToDownload.length > 0 && <Dialog
        open={pathsToDownload.length > 0}
        onClose={() => setPathsToDownload([])}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: 2,
          }}
        >
          {pathsToDownload.map((path, index) => {

            const fileName = path.split('/').pop()

            return <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              alignItems: 'center',
            }}>
              <Iconify icon="mdi:file-excel" />
              <Button
                onClick={() => {
                  window.open(path, '_blank')
                }
                }
              >
                {fileName}
              </Button>
            </Box>
          }
          )}
        </Box>
      </Dialog>}

      <DataGrid
        sx={{
          minHeight: 600,
        }}
        onColumnOrderChange={() => {
          saveSnapshot()
        }}
        apiRef={apiRef}
        slots={{
          noRowsOverlay: () => <EmptyContent sx={{ marginTop: 16 }} />,
          toolbar: (props) => (
            <GridToolbarContainer>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  <GridToolbarFilterButton {...props} />
                  <GridToolbarDensitySelector {...props} />
                  <GridToolbarColumnsButton {...props} />
                  {hasExport ? (
                    <IconButton
                      onClick={() => {
                        // Export excel
                        getDataAsync({
                          export: true,
                        })
                      }}
                    >
                      {loading ? <CircularProgress size={20} /> : <Iconify icon="mdi:file-excel" />}

                    </IconButton>
                  ) : null}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  {canClickOnSelectedButton && selected.length > 0 ? <Button
                    variant='contained'
                    disabled={!canClickOnSelectedButton}
                    onClick={() => {
                      // can click on selected button
                      if (!canClickOnSelectedButton) {
                        return;
                      }
                      getDataAsync()
                    }}
                  >
                    <Typography variant="caption"
                    >Selectate: {selected.length}</Typography>
                  </Button> : null}

                  {rightComponent || null}

                  <IconButton
                    onClick={() => {
                      getDataAsync()
                    }}
                  >
                    <Iconify icon="mdi:refresh" />
                  </IconButton>
                </Box>
              </Box>
            </GridToolbarContainer>
          ),
        }}
        rows={rows}
        getRowClassName={(eParams: any) => {
          if (duplicateKey && eParams.row[duplicateKey] && eParams.row.duplicated) {
            return 'duplicate-row'
          }
          return ''
        }}

        rowCount={totalItems}
        columns={formatedColumns}
        autoHeight={autoHeight}
        rowSelection={selectable}
        checkboxSelection={selectable}
        loading={isLoading}
        paginationMode="server"
        filterMode="server"
        filterDebounceMs={500}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 25,
            },
          },
          ...initialState,
        }}

        isRowSelectable={(p: any) => {
          if (!selectable) {
            return false
          }

          if (disabledSelectedEntities && disabledSelectedEntities.includes(p.id)) {
            return false
          }

          return true
        }}
        onRowSelectionModelChange={(newSelection, api) => {
          if (!selectable) {
            return;
          }

          setSelected(newSelection)
          if (onSelectionChange) {
            onSelectionChange(newSelection)
          }
        }}
        rowSelectionModel={selected}
        checkboxSelectionVisibleOnly={false}
        disableRowSelectionOnClick
        keepNonExistentRowsSelected
        onFilterModelChange={handleFilterChange}
        onSortModelChange={handleSortChange}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 25, 50, 100, 1000]}
        pagination
        {...dataGridProps}
      />

    </GridProvider >
  )
}

const addHardCodedFilterToParams = (params: any, hardCodedFilters: any[], extraParams: any) => {
  if (!hardCodedFilters) {
    return params
  }

  return {
    ...params,
    hardCodedFilters,
    ...extraParams
  }
}
