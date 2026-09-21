import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import bellIcon from '../../assets/common/bell.svg';
import brandLogo from '../../assets/common/brand-logo.png';
import profileAvatar from '../../assets/common/profile-avatar.png';
import searchIcon from '../../assets/common/search.svg';
import './common-layout.css';

const navigationItems = [
  { to: '/recommend', label: '식재료 추천' },
  { to: '/fridge', label: '내 냉장고 관리' },
  { to: '/recipes', label: '레시피 탐색' },
  { to: '/favorites', label: '찜한 레시피' },
];

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    const search = query ? `?search=${encodeURIComponent(query)}` : '';
    navigate(`/recipes${search}`);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__start">
            <Link className="brand" to="/" aria-label="ReciPick 홈">
              <img className="brand__logo" src={brandLogo} alt="" />
              <span className="brand__name">ReciPick</span>
            </Link>

            <form className="header-search" role="search" onSubmit={handleSearch}>
              <label className="sr-only" htmlFor="recipe-search">
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

          <nav className="primary-nav" aria-label="주요 메뉴">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `primary-nav__link${isActive ? ' primary-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button className="notification-button" type="button" aria-label="알림 확인">
              <img src={bellIcon} alt="" />
              <span className="notification-button__dot" aria-hidden="true" />
            </button>
            <div className="profile" aria-label="사용자 프로필">
              <img className="profile__avatar" src={profileAvatar} alt="" />
              <div className="profile__copy">
                <strong>ReciPick 셰프</strong>
                <span>오늘도 맛있는 한 끼</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`
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
