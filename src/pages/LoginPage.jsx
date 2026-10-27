import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login({ email });
      const from = location.state?.from;
      const destination =
        typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
          ? from
          : ROUTES.home;
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <section aria-labelledby="login-title">
      <h1 id="login-title">임시 로그인</h1>
      <p>
        화면 개발을 위한 임시 인증입니다. 실제 계정을 확인하지 않으며 데이터를 보호하지 않습니다.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mock-login-email">이메일</label>
        <input
          id="mock-login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit">임시 로그인</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>
        처음이신가요?{' '}
        <Link to={ROUTES.signUp} state={location.state}>
          임시 회원가입 화면
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
