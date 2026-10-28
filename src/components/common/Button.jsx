import styles from './Button.module.css';

// 공통 버튼 컴포넌트
//
// 사용 예시
// <Button onClick={handleSave}>저장</Button>
// <Button variant="secondary" size="small">취소</Button>
// <Button variant="text">더보기</Button>
// <Button type="submit" fullWidth disabled={isLoading}>로그인</Button>
//
// variant: 'primary'(기본) | 'secondary' | 'text'
// size: 'small' | 'medium'(기본) | 'large'
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  type = 'button',
  disabled = false,
  onClick,
  ...rest
}) {
  let className = styles.button;

  // 버튼 종류
  if (variant === 'primary') {
    className = className + ' ' + styles.primary;
  } else if (variant === 'secondary') {
    className = className + ' ' + styles.secondary;
  } else if (variant === 'text') {
    className = className + ' ' + styles.text;
  }

  // 버튼 크기
  if (size === 'small') {
    className = className + ' ' + styles.small;
  } else if (size === 'large') {
    className = className + ' ' + styles.large;
  } else {
    className = className + ' ' + styles.medium;
  }

  if (fullWidth) {
    className = className + ' ' + styles.fullWidth;
  }

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

export default Button;
