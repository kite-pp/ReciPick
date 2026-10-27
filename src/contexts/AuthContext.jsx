import { useCallback, useMemo, useState } from 'react';

import { AuthContext } from './useAuth.js';

// S1 화면 개발용 임시 인증입니다. 실제 계정 검증과 데이터 접근 제어는 Supabase Auth/RLS가 맡습니다.
const MOCK_USER_KEY = 'recipick.mockAuth.user';

function readMockUser() {
  try {
    const value = window.sessionStorage.getItem(MOCK_USER_KEY);
    if (!value) return null;

    const user = JSON.parse(value);
    return typeof user?.id === 'string' && typeof user?.email === 'string' ? user : null;
  } catch {
    return null;
  }
}

function saveMockUser(user) {
  try {
    window.sessionStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

function replaceMockUser(user, hasStoredSession) {
  if (saveMockUser(user)) return true;
  if (!hasStoredSession) return false;

  try {
    window.sessionStorage.removeItem(MOCK_USER_KEY);
  } catch {
    throw new Error('이전 임시 로그인 정보를 지울 수 없어 계정을 전환할 수 없습니다.');
  }

  return false;
}

function createMockUser(credentials) {
  const email =
    typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
  if (!email) throw new Error('이메일을 입력해 주세요.');

  return {
    id: `mock:${email}`,
    email,
    user_metadata: {},
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readMockUser);
  const [hasStoredSession, setHasStoredSession] = useState(Boolean(user));
  const [storageWarning, setStorageWarning] = useState(false);

  const login = useCallback(
    async (credentials) => {
      // 비밀번호를 검사하거나 저장하지 않습니다. #38에서 실제 Supabase Auth로 교체합니다.
      const nextUser = createMockUser(credentials);
      const isSaved = replaceMockUser(nextUser, hasStoredSession);
      setHasStoredSession(isSaved);
      setStorageWarning(!isSaved);
      setUser(nextUser);
      return nextUser;
    },
    [hasStoredSession],
  );

  const signUp = useCallback(
    async (credentials) => {
      // 실제 계정은 생성되지 않습니다. 화면 흐름만 확인하는 임시 함수입니다.
      const nextUser = createMockUser(credentials);
      const isSaved = replaceMockUser(nextUser, hasStoredSession);
      setHasStoredSession(isSaved);
      setStorageWarning(!isSaved);
      setUser(nextUser);
      return nextUser;
    },
    [hasStoredSession],
  );

  const logout = useCallback(async () => {
    try {
      window.sessionStorage.removeItem(MOCK_USER_KEY);
    } catch {
      if (hasStoredSession) {
        throw new Error(
          '임시 로그인 정보를 지울 수 없습니다. 브라우저 저장소 설정을 확인해 주세요.',
        );
      }
    }
    setUser(null);
    setHasStoredSession(false);
    setStorageWarning(false);
  }, [hasStoredSession]);

  const updateProfile = useCallback(
    async (profile) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        throw new Error('수정할 프로필 정보를 확인해 주세요.');
      }

      const nextUser = { ...user, user_metadata: { ...user.user_metadata, ...profile } };
      const isSaved = saveMockUser(nextUser);
      if (!isSaved && hasStoredSession) {
        throw new Error('프로필 정보를 저장할 수 없습니다. 브라우저 저장소 설정을 확인해 주세요.');
      }
      setHasStoredSession(isSaved);
      setStorageWarning(!isSaved);
      setUser(nextUser);
      return nextUser;
    },
    [user, hasStoredSession],
  );

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading: false,
      signUp,
      login,
      logout,
      updateProfile,
    }),
    [user, signUp, login, logout, updateProfile],
  );

  return (
    <AuthContext value={value}>
      {user && storageWarning && (
        <p role="alert">
          브라우저 저장소에 접근할 수 없어 현재 로그인은 메모리에만 보관됩니다. 새로고침하면 이
          로그인 상태가 유지되지 않을 수 있습니다.
        </p>
      )}
      {children}
    </AuthContext>
  );
}
