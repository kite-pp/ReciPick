import FridgeCard from "../components/fridge/FridgeCard.jsx";
import FridgeHeader from "../components/fridge/FridgeHeader.jsx";
import FridgeAlert from "../components/fridge/FridgeAlert.jsx";
import { ingredients } from "../data/ingredients.js";
import styles from '../components/fridge/FridgeCard.module.css';

function FridgePage() {

  console.log(ingredients);




  return (
    <>
      <FridgeHeader />
      <FridgeAlert />

      <div className={styles.cardGrid}>
        {ingredients.map((ingredient) => (
          <FridgeCard
            key={ingredient.id}
            ingredient={ingredient}
          />
        ))}
    </div>
    </>
  );
}


export default FridgePage;
