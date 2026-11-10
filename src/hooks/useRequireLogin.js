import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';

// 로그인이 필요한 버튼(찜 등)을 눌렀을 때 쓰는 훅
// 로그인 했으면 true, 안 했으면 로그인 페이지로 보낼지 물어보고 false
//
// 사용 예시
// const requireLogin = useRequireLogin();
// const handleFavoriteClick = () => {
//   if (!requireLogin()) return;
//   toggleFavorite(recipe.id);
// };

export function useRequireLogin() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireLogin = () => {
    if (isLoggedIn) {
      return true;
    }

    const isOk = window.confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동할까요?');
    if (isOk) {
      navigate(ROUTES.login, { state: { from: location.pathname + location.search } });
    }
    return false;
  };

  return requireLogin;
}
