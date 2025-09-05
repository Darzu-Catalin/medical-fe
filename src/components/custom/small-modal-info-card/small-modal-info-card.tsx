
import Iconify from '@/components/iconify';
import { useRouter } from 'next/navigation';

import { Box, Theme, SxProps, Typography } from '@mui/material'


const SmallModalInfoCard = ({
  model,
  sx,
}: {
  model: any,
  sx?: SxProps<Theme>
}) => {


  const router = useRouter();

  if (!model) {
    return null
  }

  const { title, subtitle, icon, onClick } = getModelInfo(model, router);


  return (
    <Box sx={{
      display: 'flex',
      justifyContent: "flex-start",
      ...sx
    }}>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          position: "relative",
          cursor: "pointer",
          borderRadius: 1,
          '&:hover': {
            transition: "all 0.2s",
            transform: "scale(1.02)",
            backgroundColor: "background.default",
          },
          overflow: "hidden",
          gap: 1,
        }}
      >
        <Box sx={{
          bgcolor: "primary.main",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
        >
          {icon}
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 1,
        }}>

          <Typography variant="caption" sx={{
            color: "primary.main"
          }}>
            {title}
          </Typography>
          <Typography sx={{
            mt: -0.5,
            opacity: 0.5,
          }} variant="caption">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export const getModelInfo = (model: any, router: any) => {

  const toReturn = {
    icon: <Box />,
    title: "",
    subtitle: "",
    onClick: () => { }
  }

  if (model.model_type === "App\\Models\\User") {
    toReturn.icon = <Iconify
      color="white"
      icon="mdi:car"
    />
    toReturn.title = model.number
    toReturn.subtitle = model.vin
    toReturn.onClick = () => {
      // debugger
    }
  }

  return toReturn
}

export default SmallModalInfoCard
