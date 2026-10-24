import { Outlet } from 'react-router-dom';

import Footer from './Footer.jsx';
import Header from './Header.jsx';
import styles from './Layout.module.css';

function Layout() {
  return (
    <div className={styles['app-shell']}>
      <a className={styles['skip-link']} href="#main-content">
        본문 바로가기
      </a>
      <Header />
      <main className={styles['app-main']} id="main-content">
        <div className={styles['app-content']}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
