import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';
import { getRedirectPath, validateEmail } from '../utils/authValidation.js';
import styles from './AuthPage.module.css';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    // 로그인은 형식만 확인하고 비밀번호 길이 규칙은 회원가입에서만 검사합니다.
    const nextErrors = {
      email: validateEmail(form.email),
      password: form.password ? '' : '비밀번호를 입력해 주세요.',
    };
    setErrors(nextErrors);
    setFormError('');
    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(getRedirectPath(location.state?.from, ROUTES.home), { replace: true });
    } catch (loginError) {
      setFormError(loginError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page} aria-labelledby="login-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 id="login-title" className={styles.title}>
            로그인
          </h1>
          <p className={styles.subtitle}>
            로그인하면 냉장고와 찜한 레시피를 어디서든 이어서 볼 수 있어요.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              id="login-email"
              name="email"
              type="email"
              label="이메일"
              placeholder="example@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
            />
            <Input
              id="login-password"
              name="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting}
            />
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className={styles.switch}>
          아직 계정이 없나요?
          <Link to={ROUTES.signUp} state={location.state}>
            회원가입
          </Link>
        </p>

        {/* #38에서 Supabase Auth로 교체하면 이 안내를 제거합니다. */}
        <p className={styles.notice}>
          현재는 화면 확인용 임시 로그인으로, 비밀번호를 검사하지 않습니다.
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
