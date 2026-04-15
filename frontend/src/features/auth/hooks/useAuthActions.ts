import { authApi, type LoginCredentials } from '@/features/auth/api/authApi';
import { useAppStore } from '@/stores/appStore';

export const useAuthActions = () => {
  const { logout: clearSession, setLoading, setUser } = useAppStore();

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    clearSession();
    localStorage.removeItem('auth_token');
  };

  return {
    login,
    logout,
    setAppLoading: setLoading,
  };
};
