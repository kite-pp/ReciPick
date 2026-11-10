import styles from './Button.module.css';

// 사용 예시
// <Button onClick={handleSave}>저장</Button>
// <Button variant="secondary" size="small">취소</Button>
// <Button type="submit" fullWidth disabled={isLoading}>로그인</Button>
// variant: 'primary'(기본) | 'secondary' | 'text' / size: 'small' | 'medium'(기본) | 'large'
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  type = 'button',
  ...rest
}) {
  let className = styles.button;

  if (variant === 'secondary') {
    className = className + ' ' + styles.secondary;
  } else if (variant === 'text') {
    className = className + ' ' + styles.text;
  } else {
    className = className + ' ' + styles.primary;
  }

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
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}

export default Button;
