import { Box, Card, Theme, SxProps, Typography } from "@mui/material";


const FancyCard = ({
    title,
    subtitle,
    children,
    sx
}: {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}) => <Card sx={{
    borderRadius: 2,
    p: 3,
    marginBottom: 4,
    boxShadow:0,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    ...sx
}}>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? <Typography variant="body2">{subtitle}</Typography> : null}

        <Box sx={{
            mt: 3
        }}>
            {children}
        </Box>
    </Card>


export default FancyCard;