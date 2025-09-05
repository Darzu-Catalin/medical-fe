'use client'

import ComingSoonIllustration from "@/assets/illustrations/coming-soon-illustration"

import { Box, Typography } from "@mui/material"


const DashboardView = () => {
    console.log('DashboardView')

    return <Box sx={{
        maxWidth: 480,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <ComingSoonIllustration />
        <Typography sx={{
            mt: 2
        }}>Coming soon...</Typography>
    </Box>
}

export default DashboardView