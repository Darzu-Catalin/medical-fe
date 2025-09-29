'use client'

import { useEffect } from 'react';
import { DISABLE_AUTH, getPathAfterLogin } from '@/config-global'
import { paths } from '@/routes/paths';
import { useAppSelector } from '@/redux/store';

import { useRouter } from 'src/routes/hooks'

export default function HomePageView() {
    const router = useRouter()

    const user = useAppSelector((state) => state.auth.user)
    const userRole = useAppSelector((state) => state.auth.userRole)
    // redirect to role-specific dashboard if user is logged in or to login page if not

    useEffect(() => {
        if (DISABLE_AUTH) return
        if (!user) {
            router.push(paths.auth.login);
        } else {
            // Redirect to role-specific dashboard
            const dashboardPath = getPathAfterLogin(userRole)
            router.push(dashboardPath);
        }
    }, [user, userRole, router])

    return <>
    </>
}
