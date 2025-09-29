'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { getPathAfterLogin } from '@/config-global';
import { LoadingScreen } from '@/components/ui/minimals/loading-screen';

const DashboardView = () => {
  const router = useRouter();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Only redirect if we have a user and they're on the generic dashboard
    if (user && userRole) {
      const currentPath = window.location.pathname;
      const isGenericDashboard = currentPath === '/dashboard' || 
                                currentPath === '/en/dashboard' || 
                                currentPath === '/ro/dashboard';
      
      if (isGenericDashboard) {
        const roleBasedPath = getPathAfterLogin(userRole);
        console.log(`Redirecting ${userRole} from ${currentPath} to ${roleBasedPath}`);
        router.replace(roleBasedPath);
      }
    }
  }, [user, userRole, router]);

  // Show loading while redirecting
  return <LoadingScreen />;
};

export default DashboardView;