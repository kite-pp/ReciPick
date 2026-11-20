import { useRef, useState } from 'react';

import ShoppingHeader from '../components/shopping/ShoppingHeader.jsx';
import ShoppingSummary from '../components/shopping/ShoppingSummary.jsx';
import ShoppingItem from '../components/shopping/ShoppingItem.jsx';
import ShoppingTip from '../components/shopping/ShoppingTip.jsx';
import { ingredients } from '../data/ingredients.js';
import styles from '../components/shopping/ShoppingListPage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';

function ShoppingListPage() {
  const { shoppingList, removeShoppingItem, isInFridge, addFridgeIngredient } = useUserData();
  // 냉장고로 옮기는 중인지 (버튼을 두 번 눌러 같은 재료가 두 번 들어가지 않게 막음)
  // isMoving: 버튼을 비활성화하는 화면용 값 (다음 화면 갱신 때 반영됨)
  // movingRef: 바로 반영되는 값 (화면 갱신 전에 연달아 눌러도 막기 위해 함께 사용)
  const [isMoving, setIsMoving] = useState(false);
  const movingRef = useRef(false);

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

  // 구매 완료한 재료를 냉장고에 넣고 장보기에서 빼기
  const handleMoveToFridge = async () => {
    // 이미 옮기는 중이면 다시 시작하지 않기
    if (movingRef.current) return;

    if (checkedCount === 0) {
      alert('구매 완료한 재료가 없습니다.');
      return;
    }

    if (!confirm('구매 완료한 재료를 냉장고에 넣을까요?')) return;

    movingRef.current = true;
    setIsMoving(true);
    try {
      let addedCount = 0;
      for (const item of shoppingList) {
        if (!item.checked) continue;

        // 냉장고에 없는 재료만 1개로 넣기 (이미 있으면 장보기에서만 빼기)
        if (!isInFridge(item.ingredientId)) {
          const saved = await addFridgeIngredient({
            ingredientId: item.ingredientId,
            quantity: 1,
            unit: '개',
          });
          // 냉장고 저장에 실패하면 장보기에 남겨 두기 (다시 시도할 수 있게)
          if (!saved) continue;
          addedCount = addedCount + 1;
        }
        await removeShoppingItem(item.ingredientId);
      }

      alert(`냉장고에 재료 ${addedCount}개를 넣었어요.`);
    } finally {
      // 성공하든 실패하든 끝나면 다시 누를 수 있게
      movingRef.current = false;
      setIsMoving(false);
    }
  };

  return (
    <div className={styles.page}>
      <ShoppingHeader
        onRemoveChecked={handleRemoveChecked}
        onMoveToFridge={handleMoveToFridge}
        isMoving={isMoving}
      />

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
