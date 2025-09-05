'use client'

import { useEffect } from 'react';
import { paths } from '@/routes/paths';
import { useAppSelector } from '@/redux/store';

import { useRouter } from 'src/routes/hooks'

export default function HomePageView() {
    const router = useRouter()

    const user = useAppSelector((state) => state.auth.user)
    // redirect to dashboard if user is logged in or to login page if not

    useEffect(() => {
        if (!user) {
            router.push(paths.auth.login);
        } else {
            router.push(paths.dashboard.root);
        }
    }, [user, router])

    return <>
    </>
}
