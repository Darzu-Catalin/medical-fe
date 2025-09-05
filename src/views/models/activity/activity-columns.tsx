import Link from 'next/link';
import { useState } from 'react';
import { paths } from '@/routes/paths';
import Iconify from '@/components/iconify'
import { useTranslations } from 'next-intl'
import { fDateTime } from '@/utils/format-time';
import Scrollbar from '@/components/ui/minimals/scrollbar';
import {
  idColumn,
  stringColumn,
  fullDateColumn,
} from '@/views/dashboard/utils/data-grid-columns/common-columns'

import { GridColDef } from '@mui/x-data-grid-pro'
import { Box, Button, Dialog, Typography, IconButton } from '@mui/material';

export const activityClientColumns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    ...idColumn,
  },
  {
    field: 'event',
    headerName: 'Acțiune',
  },
  {
    field: 'created_at',
    headerName: 'S-a întâmplat la',
    ...fullDateColumn,
  },
  {
    field: 'causer',
    headerName: 'Modificat de',
    ...stringColumn,
    renderCell: (params) => {

      const causerType = params?.row?.causer_type
      const causer = params?.row?.causer
      const isUser = causerType === 'App\\Models\\User';

      if (!causerType || !causer) return <Box>Sistem</Box>

      if (isUser) {
        // only last part of the model
        return <Link
          href={paths.dashboard.user.edit(causer?.id)}
        >{causer.first_name ?? "Anonim"} {causer?.last_name ?? "Anonim"}</Link>
      }
      const model = causerType.split('\\').pop()

      return <Box>{model} {params?.row?.causer?.id}</Box>

    }
  },
  {
    field: 'check',
    headerName: 'Vezi detalii',
    renderCell: (params) => <CheckDetailsButton {...params} />
  },
];

const generateChangeDescription = (oldData: any, newData: any, t: any): string[] => {
  const changes: string[] = [];
  const updateDate = fDateTime(newData.updated_at);

  const isCreation = Object.keys(oldData).length === 0;

  if (isCreation) {
    changes.push(`${t('General.onTheDateOf')} ${updateDate} ${t('General.wasCreated')}.`);
  } else {
    changes.push(`${t('General.onTheDateOf')} ${updateDate} ${t('General.hasBeenChanged')}:`);
  }

  Object.keys(newData).forEach(key => {
    if (key !== 'updated_at') {
      if (oldData[key] === undefined) {
        changes.push(`${key} ${t('General.wasAddedWithTheValue')} "${newData[key]}"`);
      } else if (oldData[key] !== newData[key]) {
        if (key === 'created_at') {
          const oldDate = fDateTime(oldData[key]);
          const newDate = fDateTime(newData[key]);
          changes.push(`${key} ${t('General.from')} "${oldDate}" ${t('General.into')} "${newDate}"`);
        } else {
          changes.push(`${key} ${t('General.from')} "${oldData[key]}" ${t('General.into')} "${newData[key]}"`);
        }
      }
    }
  });

  return changes;
};

const CheckDetailsButton = (params: any) => {
  const [visible, setVisible] = useState(false);
  const t = useTranslations();
  const oldData = params?.row?.properties?.old || {};
  const newData = params?.row?.properties?.attributes || {};
  const changes = generateChangeDescription(oldData, newData, t);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => {
          setVisible(true)
        }}
      >
        Vezi
      </Button>

      <Dialog
        open={visible}
        onClose={() => setVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >

          <Box>
            <Typography variant="h6" >
              {t('General.detailsChanges')}
            </Typography>
            <Typography>{changes[0]}</Typography>
          </Box>

          <IconButton onClick={() => {
            setVisible(false)
          }}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>

        <Scrollbar sx={{
          maxHeight: '50vh',
          p: 2,
        }}>
          {changes.slice(1).map((change, index) => {

            // first element is the key 
            const key = change.split(' ')[0];
            const rest = change.split(' ').slice(1).join(' ');


            return (
              <Box sx={{
                mb: 1,
                fontSize: 14,
                p: 1,
                bgcolor: index % 2 === 0 ? 'background.default' : 'background.neutral',
              }}>
                <Box component="span" sx={{
                  fontWeight: 'bold',
                }}>{key}</Box> {rest}
              </Box>
            )
          })}
        </Scrollbar>
      </Dialog>
    </>
  );
};
