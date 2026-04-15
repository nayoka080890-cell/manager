import Login from '@/components/Login';
import AdminDashboard from '@/components/Dashboard';
import { useAppStore } from '@/stores/appStore';

const AppRouter = () => {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AdminDashboard />;
};

export default AppRouter;
