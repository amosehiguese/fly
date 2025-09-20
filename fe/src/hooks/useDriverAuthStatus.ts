import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useDriverStore } from '@/store/driverStore';

export const useDriverAuthStatus = (redirectTo = '/driver-login') => {
  const router = useRouter();
  const { isAuthenticated, token } = useDriverStore();

  useEffect(() => {
    // If not authenticated and no token, redirect to login
    if (!isAuthenticated && !token) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, token, redirectTo]);

  return {
    isAuthenticated,
    token,
  };
};
