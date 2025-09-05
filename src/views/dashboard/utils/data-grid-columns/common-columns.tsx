import { fDate } from '@/utils/format-time'

import { GridColTypeDef } from '@mui/x-data-grid-pro'

export const basicSettingsColumn: GridColTypeDef = {
  minWidth: 150,
  align: 'left',
  headerAlign: 'left',
}


export const dateColumn: GridColTypeDef = {
  type: 'date',
  valueGetter: (value: any) => {
    if (!value) {
      return null
    }
    return new Date(value)
  },
  valueFormatter: (value: any) => {

    if (!value) {
      return null
    }
    return fDate(value)
  },
  ...basicSettingsColumn,
}
export const fullDateColumn: GridColTypeDef = {
  type: 'date',
  valueGetter: (value: any) => {
    if (!value) {
      return null
    }

    return new Date(value)
  },
  valueFormatter: (value: any) => {

    if (!value) {
      return null
    }
    return fDate(value, 'dd/MM/yyyy HH:mm')
  },
  ...basicSettingsColumn,
}


export const disabledColumn: GridColTypeDef = {
  disableColumnMenu: true,
  sortable: false,
  filterable: false,
}

export const idColumn: GridColTypeDef = {
  width: 100,
  align: 'center',
  headerAlign: 'center',
  type: 'number',
}

export const nestedValueColumn: GridColTypeDef = {
  ...basicSettingsColumn,
  valueGetter: (value, row, field) => {
    // if doesn't have nested value
    if (!field.field.includes('.')) {
      return row[field.field];
    }

    // split by dot
    const fieldName = field.field.split('.');

    // get the nested value
    return fieldName.reduce((acc, current) => {
      if (acc) {
        return acc[current];
      }
      return '';
    }, row);
  },
}

export const nestedValueColumnMultiple: GridColTypeDef = {
  ...basicSettingsColumn,
  filterable: false,
  valueGetter: (value, row, field) => {
    // if doesn't have nested value

    if (!field.field.includes('.')) {
      return row[field.field];
    }

    // split by dot
    const fieldName = field.field.split('.');

    // is an array we need to return all elements
    const arrayWithValues = row[fieldName[0]];
    const restOfFieldName = fieldName.slice(1).join('.');

    if (!arrayWithValues) {
      return '';
    }

    return arrayWithValues.map((z: any) => fieldName.slice(1).reduce((acc, current) => {

      if (acc) {
          return acc[restOfFieldName];
        }
        return '';
      }, z)).join(', ');
  },
}

export const countColumn: GridColTypeDef = {
  type: 'number',
  ...disabledColumn,
  ...basicSettingsColumn,
}

export const stringColumn: GridColTypeDef = {
  type: 'string',
  ...basicSettingsColumn,
}

export const numberColumn: GridColTypeDef = {
  type: 'number',
  ...basicSettingsColumn,
}

export const booleanColumn: GridColTypeDef = {
  width: 100,
  headerAlign: 'center',
  align: 'center',
  type: 'boolean',
}
