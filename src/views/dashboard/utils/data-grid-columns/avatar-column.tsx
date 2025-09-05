import { RouterLink } from '@/routes/components'
import { CustomAvatar } from '@/components/custom/custom-avatar'
import { disabledColumn } from '@/views/dashboard/utils/data-grid-columns/common-columns'

import Link from '@mui/material/Link'
import { GridColTypeDef } from '@mui/x-data-grid-pro'

export function AvatarCell({
  href,
  image,
  alt,
}: {
  href: string
  image: string | null | undefined
  alt: string
}) {
  return (
    <Link component={RouterLink} href={href}>
      <CustomAvatar
        sx={{
          width: 40,
          height: 40,
        }}
        src={image || ''}
        alt={alt}
        name={alt}
      />
    </Link>
  )
}

export const avatarColumn: GridColTypeDef = {
  width: 100,
  headerAlign: 'center',
  align: 'center',
  ...disabledColumn,
}
