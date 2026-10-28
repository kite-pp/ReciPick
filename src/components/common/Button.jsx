import styles from './Button.module.css';

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
