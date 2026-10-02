import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import bellIcon from '../../assets/common/bell.svg';
import brandLogo from '../../assets/common/brand-logo.png';
import profileAvatar from '../../assets/common/profile-avatar.png';
import searchIcon from '../../assets/common/search.svg';
import { PRIMARY_NAVIGATION_ITEMS, ROUTES } from '../../constants/routes.js';
import styles from './Layout.module.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
            <button className={styles['notification-button']} type="button" aria-label="알림 확인">
              <img src={bellIcon} alt="" />
              <span className={styles['notification-button__dot']} aria-hidden="true" />
            </button>
            <Link className={styles.profile} to={ROUTES.myPage} aria-label="마이페이지">
              <img className={styles['profile__avatar']} src={profileAvatar} alt="" />
              <div className={styles['profile__copy']}>
                <strong>ReciPick 셰프</strong>
                <span>오늘도 맛있는 한 끼</span>
              </div>
            </Link>
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
