import styles from './FridgeAdd.module.css';
import { ingredients } from '../../data/ingredients.js';
import { INGREDIENT_UNITS } from '../../data/constants.js';
import { useState } from 'react';
import { useUserData } from '../../contexts/UserDataContext.jsx';

function FridgeAdd({ mode, ingredient, onClose }) {
  const { fridgeIngredients, addFridgeIngredient, updateFridgeIngredient } = useUserData();
  const fridgeItem = fridgeIngredients.find((item) => item.ingredientId === ingredient?.id);
  const isEditMode = mode === 'edit';

  const [searchText, setSearchText] = useState('');
  const [selectIngredient, setSelectIngredient] = useState(ingredient ?? null);
  const [isClick, setIsClick] = useState(!isEditMode);
  const [quantity, setQuantity] = useState(fridgeItem?.quantity ?? 1);
  const [unit, setUnit] = useState(fridgeItem?.unit ?? '개');
  const [expiresAt, setExpiresAt] = useState(fridgeItem?.expiresAt ?? '');

  const saveSubmit = async (event) => {
    event.preventDefault();

    if (isEditMode) {
      await updateFridgeIngredient(ingredient.id, {
        quantity,
        unit,
        expiresAt: expiresAt || null,
      });
    } else {
      if (!selectIngredient) return;

      await addFridgeIngredient({
        ingredientId: selectIngredient.id,
        quantity,
        unit,
        expiresAt: expiresAt || null,
      });
    }

    onClose();
  };

  return (
    <form className={styles.form} onSubmit={saveSubmit}>
      <div className={styles.heading}>
        <span>SMART FRIDGE</span>
        <h2>{isEditMode ? '식재료 정보 수정' : '새 식재료 추가'}</h2>
        <p>
          {isEditMode
            ? '보관 중인 식재료의 수량과 소비기한을 수정할 수 있어요.'
            : '재료를 검색해 선택하고 수량과 소비기한을 입력하면 소비기한 알림과 맞춤 추천에 활용돼요.'}
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="ingredient-search">식재료 검색</label>

        <input
          id="ingredient-search"
          type="search"
          placeholder={
            isEditMode
              ? selectIngredient?.name
              : isClick
                ? '재료 이름으로 검색'
                : (selectIngredient?.name ?? '')
          }
          value={isEditMode ? (selectIngredient?.name ?? '') : undefined}
          readOnly={isEditMode}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        {!isEditMode && isClick ? (
          <>
            <div className={styles.searchResults}>
              {ingredients
                .filter((ingredient) => ingredient.name.includes(searchText))
                .map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => {
                      setSelectIngredient(ingredient);
                      setIsClick(false);
                    }}
                  >
                    <span>{ingredient.name}</span>
                    <span>{ingredient.category}</span>
                  </button>
                ))}
            </div>{' '}
          </>
        ) : (
          <div></div>
        )}

        <div className={styles.heading}>
          <span>등록된 재료 목록에서 선택해요. 목록에 없는 재료는 추가할 수 없어요.</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="ingredient-category">카테고리(자동)</label>

        <input
          id="ingredient-category"
          type="text"
          placeholder="재료를 선택해 주세요"
          readOnly
          value={selectIngredient?.category ?? ''}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="ingredient-quantity">보유 수량</label>

        <input
          id="ingredient-quantity"
          type="number"
          min="0"
          value={quantity}
          onChange={(event) => {
            setQuantity(Number(event.target.value));
          }}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="ingredient-unit">단위</label>

        <select id="ingredient-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {INGREDIENT_UNITS.map((i) => (
            <option value={i} key={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldFull}>
        <label htmlFor="ingredient-expires-at">소비기한</label>

        <input
          id="ingredient-expires-at"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onClose}>
          취소
        </button>
        <button type="submit">{isEditMode ? '변경사항 저장' : '식재료 저장'}</button>
      </div>
    </form>
  );
}

export default FridgeAdd;
