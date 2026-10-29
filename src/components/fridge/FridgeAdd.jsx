import styles from './FridgeAdd.module.css';
import { ingredients } from "../../data/ingredients.js";
import { RECIPE_CATEGORIES, DIFFICULTIES, INGREDIENT_CATEGORIES, COOKING_TIME_FILTERS, INGREDIENT_UNITS } from "../../data/constants.js";
import { useState } from "react";
import { useUserData } from '../../contexts/UserDataContext.jsx';


function FridgeAdd({ setIsAddModalOpen }) {

    const [searchText, setSearchText] = useState('');
    const [selectIngredient, setSelectIngredient] = useState(null);
    const [isClick, setIsClick] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('개');
    const [expiresAt, setExpiresAt] = useState('');

    console.log(selectIngredient)

    const { addFridgeIngredient } = useUserData();

    const saveSubmit = () => {

        addFridgeIngredient({
        ingredientId: selectIngredient.id,
        quantity,
        unit,
        expiresAt: expiresAt || null,
        });
    }


    return (
        <form className={styles.form} onSubmit={saveSubmit}>
            <div className={styles.heading}>
                <span>SMART FRIDGE</span>
                <h2>새 식재료 추가</h2>
                <p>
                    재료를 검색해 선택하고 수량과 소비기한을 입력하면 소비기한 알림과
                    맞춤 추천에 활용돼요.
                </p>
            </div>

            <div className={styles.field}>
                <label htmlFor="ingredient-search">식재료 검색</label>

                <input
                    id="ingredient-search"
                    type="search"
                    placeholder={isClick? "재료 이름으로 검색" : selectIngredient?.name ?? ''}
                    onChange={(e) => {
                        setSearchText(e.target.value)
                    }}
                />
                {isClick ? <>
                <div className={styles.searchResults}>
                    {ingredients
                        .filter((ingredient) =>
                            ingredient.name.includes(searchText)
                        )
                        .map((ingredient) => (
                            <button
                                key={ingredient.id}
                                type="button"
                                onClick={() => {
                                    setSelectIngredient(ingredient)
                                    setIsClick(false)
                                    }
                                }
                            >
                                <span>{ingredient.name}</span>
                                <span>{ingredient.category}</span>
                            </button>
                        ))}
                </div> </> :

                <div></div>
                }
                
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
                    defaultValue="1"
                    onChange={(event) => {
                        setQuantity(Number(event.target.value));
                    }}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="ingredient-unit">단위</label>

                <select id="ingredient-unit" defaultValue="개" onChange={(e) => setUnit(e.target.value)}>
                    {INGREDIENT_UNITS.map((i) => 
                    <option value={i} key={i}>{i}</option>
                    )}
                </select>
            </div>

            <div className={styles.fieldFull}>
                <label htmlFor="ingredient-expires-at">소비기한</label>

                <input
                    id="ingredient-expires-at"
                    type="date"
                    onChange={(e) => setExpiresAt(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>취소</button>
                <button type="submit">식재료 저장</button>
            </div>
        </form>
    );
}

export default FridgeAdd;