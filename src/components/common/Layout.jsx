import { Outlet } from 'react-router-dom';

import Footer from './Footer.jsx';
import Header from './Header.jsx';

function Layout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        본문 바로가기
      </a>
      <Header />
      <main className="app-main" id="main-content">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
