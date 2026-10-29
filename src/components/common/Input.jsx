import styles from './Input.module.css';

// 사용 예시
// <Input id="login-email" label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
// <Input id="nickname" label="닉네임" error="닉네임을 입력해 주세요." />
// <Input id="amount" label="수량" helperText="숫자만 입력해 주세요." />
// id는 label 연결 때문에 꼭 넣어주세요
function Input({ id, label, error, helperText, ...rest }) {
  let inputClassName = styles.input;
  if (error) {
    inputClassName = inputClassName + ' ' + styles.inputError;
  }

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={inputClassName} aria-invalid={error ? true : false} {...rest} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
}

export default Input;
