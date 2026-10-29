import FridgeCard from "../components/fridge/FridgeCard.jsx";
import FridgeHeader from "../components/fridge/FridgeHeader.jsx";
import FridgeAlert from "../components/fridge/FridgeAlert.jsx";
import { ingredients } from "../data/ingredients.js";

function FridgePage() {

  console.log(ingredients);




  return (
    <>
      <FridgeHeader />
      <FridgeAlert />

      {ingredients.map((ingredient) => (
          <FridgeCard key={ingredient.id} ingredient={ingredient} />
        )) 
      }
    </>
  );
}


export default FridgePage;
