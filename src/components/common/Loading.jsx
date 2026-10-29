import styles from './Loading.module.css';

// 사용 예시
// {isLoading && <Loading />}
// <Loading text="레시피를 불러오는 중..." />
function Loading({ text = '불러오는 중...' }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true"></span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}

export default Loading;
