import styles from './ShoppingItem.module.css';
import { useUserData } from '../../contexts/UserDataContext.jsx';

function ShoppingItem({ item, ingredient }) {
  const { ingredientId, checked } = item;
  const { name } = ingredient;

  // UserDataContext 에 들어있는 장보기 함수 가져오기
  const { toggleShoppingItem, removeShoppingItem } = useUserData();

  const handleToggle = () => {
    toggleShoppingItem(ingredientId);
  };

  const handleRemove = () => {
    removeShoppingItem(ingredientId);
  };

  return (
    <li className={styles.item}>
      <label className={styles.checkLabel}>
        <input type="checkbox" checked={checked} onChange={handleToggle} />
        <span className={checked ? `${styles.name} ${styles.checked}` : styles.name}>{name}</span>
      </label>

      <button type="button" className={styles.removeButton} onClick={handleRemove}>
        삭제
      </button>
    </li>
  );
}

export default ShoppingItem;
