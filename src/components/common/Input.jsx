import styles from './Input.module.css';

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
