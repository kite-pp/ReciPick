import ShoppingHeader from '../components/shopping/ShoppingHeader.jsx';
import ShoppingSummary from '../components/shopping/ShoppingSummary.jsx';
import ShoppingItem from '../components/shopping/ShoppingItem.jsx';
import ShoppingTip from '../components/shopping/ShoppingTip.jsx';
import { ingredients } from '../data/ingredients.js';
import styles from '../components/shopping/ShoppingListPage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';

function ShoppingListPage() {
  const { shoppingList, removeShoppingItem } = useUserData();

  // 체크한 항목 개수 세기
  let checkedCount = 0;
  for (const item of shoppingList) {
    if (item.checked) {
      checkedCount++;
    }
  }

  const handleRemoveChecked = () => {
    if (checkedCount === 0) {
      alert('구매 완료한 재료가 없습니다.');
      return;
    }

    if (!confirm('구매 완료한 재료를 삭제하시겠습니까?')) return;

    for (const item of shoppingList) {
      if (item.checked) {
        removeShoppingItem(item.ingredientId);
      }
    }
  };

  return (
    <div className={styles.page}>
      <ShoppingHeader onRemoveChecked={handleRemoveChecked} />

      <ShoppingSummary totalCount={shoppingList.length} checkedCount={checkedCount} />

      <section className={styles.listBox}>
        <h2>이번 장보기</h2>
        <p>필요한 재료를 체크하면 구매 완료 상태로 바뀝니다.</p>

        {shoppingList.length === 0 ? (
          <div className={styles.empty}>
            <strong>장보기 목록이 비어 있어요.</strong>
            <span>레시피 상세에서 부족한 재료를 담아 보세요.</span>
          </div>
        ) : (
          <ul className={styles.list}>
            {shoppingList.map((item) => {
              // ingredientId 로 재료 정보(이름) 찾기
              const ingredient = ingredients.find((ingredient) => {
                return ingredient.id === item.ingredientId;
              });

              if (!ingredient) {
                return null;
              }

              return <ShoppingItem key={item.ingredientId} item={item} ingredient={ingredient} />;
            })}
          </ul>
        )}
      </section>

      <ShoppingTip />
    </div>
  );
}

export default ShoppingListPage;
