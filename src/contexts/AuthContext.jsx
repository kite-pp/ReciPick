import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../utils/supabaseClient.js';
import { AuthContext } from './useAuth.js';

const AUTH_ERROR_MESSAGES = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  user_already_exists: '이미 가입된 이메일입니다.',
  email_exists: '이미 가입된 이메일입니다.',
  email_address_invalid: '사용할 수 없는 이메일 주소입니다.',
  weak_password: '비밀번호가 너무 짧거나 단순합니다.',
  email_not_confirmed: '이메일 인증을 완료한 뒤 로그인해 주세요.',
  over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  over_email_send_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  signup_disabled: '현재 회원가입을 할 수 없습니다.',
};

function toAuthError(error) {
  const message =
    AUTH_ERROR_MESSAGES[error?.code] ?? '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
  return new Error(message, { cause: error });
}

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase 설정이 없어 로그인할 수 없습니다. 관리자에게 문의해 주세요.');
  }
  return supabase;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  // 저장된 세션 복원(INITIAL_SESSION)과 로그인·로그아웃·토큰 갱신을 한곳에서 반영합니다.
  useEffect(() => {
    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw toAuthError(error);
    return data.user;
  }, []);

  const signUp = useCallback(async ({ email, password, nickname }) => {
    const { data, error } = await requireClient().auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });
    if (error) throw toAuthError(error);
    // 이메일 인증을 켠 프로젝트에서는 세션 없이 가입만 완료됩니다.
    return { user: data.user, needsEmailConfirmation: !data.session };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await requireClient().auth.signOut();
    if (error) throw toAuthError(error);
  }, []);

  const updateProfile = useCallback(async (profile) => {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      throw new Error('수정할 프로필 정보를 확인해 주세요.');
    }

    const { data, error } = await requireClient().auth.updateUser({ data: profile });
    if (error) throw toAuthError(error);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading,
      signUp,
      login,
      logout,
      updateProfile,
    }),
    [user, isLoading, signUp, login, logout, updateProfile],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
