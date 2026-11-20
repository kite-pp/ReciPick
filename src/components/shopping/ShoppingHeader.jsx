import styles from './ShoppingListPage.module.css';

function ShoppingHeader({ onRemoveChecked, onMoveToFridge }) {
  return (
    <div className={styles.header}>
      <div>
        <span>SHOPPING LIST</span>
        <h1>장보기 목록</h1>
        <p>레시피에서 부족한 재료를 담아 한 번에 체크하세요.</p>
      </div>

      <div className={styles.headerActions}>
        <button type="button" onClick={onMoveToFridge}>
          냉장고에 넣기
        </button>
        <button type="button" onClick={onRemoveChecked}>
          구매 완료 삭제
        </button>
      </div>
    </div>
  );
}

export default ShoppingHeader;
