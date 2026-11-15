import styles from './ShoppingListPage.module.css';

function ShoppingHeader({ onRemoveChecked }) {
  return (
    <div className={styles.header}>
      <div>
        <span>SHOPPING LIST</span>
        <h1>장보기 목록</h1>
        <p>레시피에서 부족한 재료를 담아 한 번에 체크하세요.</p>
      </div>

      <button type="button" onClick={onRemoveChecked}>
        구매 완료 삭제
      </button>
    </div>
  );
}

export default ShoppingHeader;
