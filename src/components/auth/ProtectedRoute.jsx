import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../contexts/useAuth.js';

function ProtectedRoute() {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p role="status">로그인 상태를 확인하고 있습니다.</p>;

  if (!isLoggedIn) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={ROUTES.login} replace state={{ from }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
