import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import bellIcon from '../../assets/common/bell.svg';
import brandLogo from '../../assets/common/brand-logo.png';
import profileAvatar from '../../assets/common/profile-avatar.png';
import searchIcon from '../../assets/common/search.svg';
import { PRIMARY_NAVIGATION_ITEMS, ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../contexts/useAuth.js';
import styles from './Layout.module.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  // 헤더에 보여줄 이름 (닉네임 없으면 이메일 앞부분)
  let userName = '';
  if (user) {
    if (user.user_metadata && user.user_metadata.nickname) {
      userName = user.user_metadata.nickname;
    } else {
      userName = user.email.split('@')[0];
    }
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

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    const search = query ? `?search=${encodeURIComponent(query)}` : '';
    navigate(`${ROUTES.recipes}${search}`);
  };

  return (
    <>
      <header className={styles['site-header']}>
        <div className={styles['site-header__inner']}>
          <div className={styles['site-header__start']}>
            <Link className={styles.brand} to={ROUTES.home} aria-label="ReciPick 홈">
              <img className={styles['brand__logo']} src={brandLogo} alt="" />
              <span className={styles['brand__name']}>ReciPick</span>
            </Link>

            <form className={styles['header-search']} role="search" onSubmit={handleSearch}>
              <label className={styles['sr-only']} htmlFor="recipe-search">
                레시피 검색
              </label>
              <input
                id="recipe-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="레시피를 검색해 보세요"
              />
              <button type="submit" aria-label="레시피 검색">
                <img src={searchIcon} alt="" />
              </button>
            </form>
          </div>

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
                <button
                  className={styles['notification-button']}
                  type="button"
                  aria-label="알림 확인"
                >
                  <img src={bellIcon} alt="" />
                  <span className={styles['notification-button__dot']} aria-hidden="true" />
                </button>
                <Link className={styles.profile} to={ROUTES.myPage} aria-label="마이페이지">
                  <img className={styles['profile__avatar']} src={profileAvatar} alt="" />
                  <div className={styles['profile__copy']}>
                    <strong>{userName}</strong>
                    <span>오늘도 맛있는 한 끼</span>
                  </div>
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
        {PRIMARY_NAVIGATION_ITEMS.map((item) => (
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
