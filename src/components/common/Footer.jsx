import { Link } from 'react-router-dom';

import brandLogo from '../../assets/common/brand-logo.png';
import { ROUTES } from '../../constants/routes.js';
import styles from './Layout.module.css';

function Footer() {
  return (
    <footer className={styles['site-footer']}>
      <div className={styles['site-footer__inner']}>
        <div className={styles['site-footer__brand-group']}>
          <Link
            className={`${styles.brand} ${styles['brand--footer']}`}
            to={ROUTES.home}
            aria-label="ReciPick 홈"
          >
            <img className={styles['brand__logo']} src={brandLogo} alt="" />
            <span className={styles['brand__name']}>ReciPick</span>
          </Link>
          <p>냉장고 속 재료로 시작하는 즐거운 요리</p>
        </div>

        <nav className={styles['footer-nav']} aria-label="서비스 안내">
          <span title="준비 중인 메뉴입니다">이용약관</span>
          <span title="준비 중인 메뉴입니다">개인정보처리방침</span>
          <a href="mailto:support@recipick.app">고객지원</a>
        </nav>
      </div>
      <p className={styles['site-footer__copyright']}>
        © {new Date().getFullYear()} ReciPick. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
