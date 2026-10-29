import FridgeCard from "../components/fridge/FridgeCard.jsx";
import FridgeHeader from "../components/fridge/FridgeHeader.jsx";
import FridgeAlert from "../components/fridge/FridgeAlert.jsx";
import { ingredients } from "../data/ingredients.js";
import styles from '../components/fridge/FridgePage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';
import FridgeAdd from "../components/fridge/FridgeAdd.jsx";
import { useState } from "react";

function FridgePage() {

  const { fridgeIngredients } = useUserData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <FridgeHeader />
      <FridgeAlert />
      <button onClick={() => setIsAddModalOpen(true)}>재료 추가</button>
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FridgeAdd setIsAddModalOpen={setIsAddModalOpen} />
          </div>
        </div>
      )}


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
                    setIsAddModalOpen(true)
                  }}
              />
          );
      })}
    </div>
    </>
  );
}


export default FridgePage;
