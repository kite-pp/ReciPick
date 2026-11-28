import { Link, NavLink, useLocation } from 'react-router-dom';

import bellIcon from '../../assets/common/bell.svg';
import cartIcon from '../../assets/common/cart.svg';
import brandLogo from '../../assets/common/brand-logo.png';
import profileAvatar from '../../assets/common/default-avatar.svg';
import searchIcon from '../../assets/common/search.svg';
import {
  MOBILE_NAVIGATION_ITEMS,
  PRIMARY_NAVIGATION_ITEMS,
  ROUTES,
} from '../../constants/routes.js';
import { useAuth } from '../../contexts/useAuth.js';
import { useUserData } from '../../contexts/UserDataContext.jsx';
import styles from './Layout.module.css';

function Header() {
  const location = useLocation();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const { shoppingList } = useUserData();

  // 헤더에 보여줄 이름 (닉네임 없으면 이메일 앞부분)
  let userName = '';
  if (user) {
    if (user.user_metadata && user.user_metadata.nickname) {
      userName = user.user_metadata.nickname;
    } else {
      userName = user.email.split('@')[0];
    }
  }

  // 장바구니(장보기) 배지: 아직 안 산 재료 개수 (10개 넘으면 9+)
  const notBoughtCount = shoppingList.filter((item) => !item.checked).length;
  let cartBadgeText = String(notBoughtCount);
  if (notBoughtCount > 9) {
    cartBadgeText = '9+';
  }

  // 로그인 후에 지금 보던 페이지로 돌아오도록 현재 주소를 같이 넘김
  let loginState = undefined;
  if (location.pathname !== ROUTES.login && location.pathname !== ROUTES.signUp) {
    loginState = { from: location.pathname + location.search };
  }

  const handleLogout = async () => {
    // 보호된 페이지(마이페이지 등)에서 로그아웃하면 ProtectedRoute가 로그인 화면으로 보내줌
    try {
      await logout();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <header className={styles['site-header']}>
        <div className={styles['site-header__inner']}>
          <Link className={styles.brand} to={ROUTES.home} aria-label="ReciPick 홈">
            <img className={styles['brand__logo']} src={brandLogo} alt="" />
            <span className={styles['brand__name']}>ReciPick</span>
          </Link>

          <nav className={styles['primary-nav']} aria-label="주요 메뉴">
            {PRIMARY_NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [styles['primary-nav__link'], isActive ? styles['primary-nav__link--active'] : '']
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles['site-header__actions']}>
            {/* 검색: Figma처럼 버튼만 두고 레시피 탐색 화면의 검색창으로 이동 */}
            <Link className={styles['search-link']} to={ROUTES.recipes}>
              <img src={searchIcon} alt="" />
              <span className={styles['search-link__text']}>검색</span>
            </Link>

            {/* 로그인 상태 확인 중 */}
            {isLoading && <div className={styles['auth-placeholder']} aria-hidden="true"></div>}

            {/* 로그인 안 했을 때 */}
            {!isLoading && !isLoggedIn && (
              <Link className={styles['login-link']} to={ROUTES.login} state={loginState}>
                로그인
              </Link>
            )}

            {/* 로그인 했을 때 */}
            {!isLoading && isLoggedIn && (
              <>
                <button className={styles['icon-button']} type="button" aria-label="알림 확인">
                  <img src={bellIcon} alt="" />
                  <span className={styles['icon-button__dot']} aria-hidden="true" />
                </button>
                <Link
                  className={styles['icon-button']}
                  to={ROUTES.shoppingList}
                  aria-label={'장보기 목록 (구매 전 ' + notBoughtCount + '개)'}
                >
                  <img src={cartIcon} alt="" />
                  {notBoughtCount > 0 && (
                    <span className={styles['icon-button__badge']} aria-hidden="true">
                      {cartBadgeText}
                    </span>
                  )}
                </Link>
                <Link className={styles.profile} to={ROUTES.myPage} aria-label="마이페이지">
                  <img className={styles['profile__avatar']} src={profileAvatar} alt="" />
                  <span className={styles['profile__name']}>{userName}님</span>
                </Link>
                <button className={styles['logout-button']} type="button" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className={styles['mobile-nav']} aria-label="모바일 주요 메뉴">
        {MOBILE_NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles['mobile-nav__link'], isActive ? styles['mobile-nav__link--active'] : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Header;
