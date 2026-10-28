import styles from './Loading.module.css';

function Loading({ text = '불러오는 중...' }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true"></span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}

export default Loading;
