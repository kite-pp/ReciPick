import styles from './EmptyState.module.css';

// 빈 목록, 검색 결과 없음 등을 보여주는 컴포넌트
// 사용 예시
// <EmptyState />
// <EmptyState title="찜한 레시피가 없어요" description="마음에 드는 레시피에 하트를 눌러보세요." />
// <EmptyState icon="🔍" title="검색 결과가 없어요" description="다른 검색어로 찾아보세요.">
//   <Button onClick={handleReset}>검색 초기화</Button>
// </EmptyState>
function EmptyState({
  icon = '🍽️',
  title = '아직 표시할 내용이 없어요',
  description = '새로운 항목을 추가하면 이곳에서 확인할 수 있어요.',
  children,
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  );
}

export default EmptyState;
