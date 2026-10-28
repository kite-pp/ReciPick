import styles from './Input.module.css';

// 공통 입력창 컴포넌트 (label + input + 안내/에러 문구)
//
// 사용 예시
// <Input
//   id="login-email"
//   label="이메일"
//   type="email"
//   value={email}
//   onChange={(event) => setEmail(event.target.value)}
//   placeholder="example@email.com"
// />
// <Input id="nickname" label="닉네임" value={name} onChange={handleChange} error="닉네임을 입력해 주세요." />
// <Input id="amount" label="수량" helperText="숫자만 입력해 주세요." />
//
// id는 label 연결 때문에 꼭 넣어주세요!
function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  ...rest
}) {
  let inputClassName = styles.input;
  if (error) {
    inputClassName = inputClassName + ' ' + styles.inputError;
  }

  // 아래 문구가 있을 때만 aria-describedby 연결
  let messageId = undefined;
  if (error || helperText) {
    messageId = id + '-message';
  }

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={inputClassName}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : false}
        aria-describedby={messageId}
        {...rest}
      />
      {error && (
        <p id={messageId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={messageId} className={styles.helper}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
