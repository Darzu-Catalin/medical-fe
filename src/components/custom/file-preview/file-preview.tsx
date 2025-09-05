import { FileType } from 'src/components/ui/minimals/upload'
import { alpha, Theme, SxProps } from '@mui/material/styles';
import { IconButton, Typography, Box } from '@mui/material'
import Iconify from '@/components/iconify'
import { useTranslations } from 'next-intl';
import { getFileTypeLabel } from './utils';

type FileIconProps = {
    file: FileType
    sx?: SxProps<Theme>
}

export default function ExternalFilePreview({
    file,
    onDelete,
    sx,
}: FileIconProps & {
    onDelete?: () => void
}) {
    const t = useTranslations();

    const renderContent =
        file.mime_type.includes("image") ? (
            <Box
                onClick={() => {
                    // new tab
                    window.open(file.absolute_path, '_blank');
                }}
                component="img"
                src={file.absolute_path}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    width: '100%',
                    height: '100%',
                }}
            />
        ) : (
            <Box
                onClick={() => {
                    window.open(file.absolute_path, '_blank');
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    borderRadius: '12px',
                    width: '100%',
                    height: '100%',
                }}
            >
                <Typography variant="h5">{getFileTypeLabel(file.mime_type)}</Typography>
                
            </Box>
        );


    if (onDelete) {
        return (
            <Box
                sx={{
                    position:"relative",
                    ...sx
                }}
            >
                {/* delete icon */}
                <IconButton onClick={onDelete} sx={{
                    position: 'absolute',
                    top: "-8px",
                    right: "-8px",
                    zIndex: 1,
                    bgcolor: "error.main",
                    color: "white",
                    // hover
                    '&:hover': {
                        bgcolor: "error.dark",
                    }
                }}>
                    <Iconify icon="mdi:trash-can" />
                </IconButton>

                {renderContent}
            </Box>
        )
    }

    return (
        <Box sx={{
            position:"relative",
            ...sx
        }}>
            {renderContent}
                <Box sx={{
                    position: "absolute",
                    bottom:0,
                    p: "2px 4px",
                    width: "100%",
                    backdropFilter: "blur(5px)",
                    background: "rgba(255,255,255,0.5)",
                    textAlign: "center",
                    overflow: "hidden",
                }}>
                {file.name}
                </Box>
        </Box>
    );
}
