import FridgeCard from '../components/fridge/FridgeCard.jsx';
import FridgeHeader from '../components/fridge/FridgeHeader.jsx';
import FridgeAlert from '../components/fridge/FridgeAlert.jsx';
import { ingredients } from '../data/ingredients.js';
import styles from '../components/fridge/FridgePage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';
import FridgeAdd from '../components/fridge/FridgeAdd.jsx';
import { useState } from 'react';

function FridgePage() {
  const { fridgeIngredients } = useUserData();

  const [modalMode, setModalMode] = useState(null);
  // null | "add" | "edit"
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  return (
    <>
      <FridgeHeader />
      <FridgeAlert />
      <button
        onClick={() => {
          setSelectedIngredient(null);
          setModalMode('add');
        }}
      >
        재료 추가
      </button>

      <div className={styles.cardGrid}>
        {ingredients.map((ingredient) => {
          // 0 개면 안보이게 추가
          let isStored = false;

          for (const item of fridgeIngredients) {
            if (item.ingredientId === ingredient.id) {
              isStored = true;
              break;
            }
          }

          if (!isStored) {
            return null;
          }
          return (
            <FridgeCard
              key={ingredient.id}
              ingredient={ingredient}
              onClick={() => {
                setSelectedIngredient(ingredient);
                setModalMode('edit');
              }}
            />
          );
        })}
      </div>

      {modalMode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FridgeAdd
              mode={modalMode}
              ingredient={selectedIngredient}
              onClose={() => {
                setModalMode(null);
                setSelectedIngredient(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default FridgePage;
