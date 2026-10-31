import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';
import {
  getRedirectPath,
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateNickname,
  validatePassword,
} from '../utils/authValidation.js';
import styles from './AuthPage.module.css';

const INITIAL_FORM = { email: '', password: '', nickname: '' };

function SignupPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
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

    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      nickname: validateNickname(form.nickname),
    };
    setErrors(nextErrors);
    setFormError('');
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
      });
      navigate(getRedirectPath(location.state?.from, ROUTES.home), { replace: true });
    } catch (signUpError) {
      setFormError(signUpError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page} aria-labelledby="signup-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 id="signup-title" className={styles.title}>
            회원가입
          </h1>
          <p className={styles.subtitle}>
            이메일만으로 바로 시작할 수 있어요. 가입하면 바로 로그인돼요.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              id="signup-email"
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
              id="signup-password"
              name="password"
              type="password"
              label="비밀번호"
              placeholder={`${MIN_PASSWORD_LENGTH}자 이상 입력하세요`}
              autoComplete="new-password"
              helperText={`${MIN_PASSWORD_LENGTH}자 이상`}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting}
            />
            <Input
              id="signup-nickname"
              name="nickname"
              label="닉네임"
              placeholder="앱에서 불릴 이름"
              autoComplete="nickname"
              value={form.nickname}
              onChange={handleChange}
              error={errors.nickname}
              disabled={isSubmitting}
            />
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '가입하는 중...' : '가입하고 시작하기'}
          </Button>
        </form>

        <p className={styles.switch}>
          이미 계정이 있나요?
          <Link to={ROUTES.login} state={location.state}>
            로그인
          </Link>
        </p>

        {/* #38에서 Supabase Auth로 교체하면 이 안내를 제거합니다. */}
        <p className={styles.notice}>
          현재는 화면 확인용 임시 회원가입으로, 실제 계정은 만들어지지 않습니다.
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
