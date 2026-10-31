const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return '이메일을 입력해 주세요.';
  if (!EMAIL_PATTERN.test(value)) return '올바른 이메일 형식이 아닙니다.';
  return '';
}

export function validatePassword(password) {
  if (!password) return '비밀번호를 입력해 주세요.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }
  return '';
}

export function validateNickname(nickname) {
  if (!nickname.trim()) return '닉네임을 입력해 주세요.';
  return '';
}

// 로그인 전 보던 화면으로 돌려보낼 때 외부 주소로 이동하지 않도록 내부 경로만 허용합니다.
export function getRedirectPath(from, fallback) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : fallback;
}
