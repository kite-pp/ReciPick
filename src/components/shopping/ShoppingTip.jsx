import styles from './ShoppingListPage.module.css';

function ShoppingTip() {
  return (
    <div className={styles.tip}>
      <h3>장보기 팁</h3>
      <p>이미 냉장고에 있는 재료는 레시피 화면에서 부족한 재료로 표시되지 않아요.</p>
    </div>
  );
}

export default ShoppingTip;
