import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await signUp({ email });
      const from = location.state?.from;
      const destination =
        typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
          ? from
          : ROUTES.home;
      navigate(destination, { replace: true });
    } catch (signUpError) {
      setError(signUpError.message);
    }
  };

  return (
    <section aria-labelledby="signup-title">
      <h1 id="signup-title">임시 회원가입</h1>
      <p>화면 개발용입니다. 실제 계정은 생성되지 않으며 이메일만 이번 탭에 저장됩니다.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mock-signup-email">이메일</label>
        <input
          id="mock-signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit">임시 회원가입</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>
        이미 시작했나요?{' '}
        <Link to={ROUTES.login} state={location.state}>
          임시 로그인 화면
        </Link>
      </p>
    </section>
  );
}

export default SignupPage;
