import styles from './IngredientIcon.module.css';

// 재료 아이콘 (장보기, 레시피 상세, 재료 검색에서 공통 사용)
// 사용 예시
// <IngredientIcon ingredient={ingredient} size={32} />
// ingredient는 src/data/ingredients.js의 재료 객체 하나
function IngredientIcon({ ingredient, size = 32 }) {
  // 재료 정보나 이미지가 없으면 아무것도 그리지 않기
  if (!ingredient || !ingredient.image) {
    return null;
  }

  return (
    <img
      className={styles.icon}
      src={ingredient.image}
      alt=""
      width={size}
      height={size}
      loading="lazy"
    />
  );
}

export default IngredientIcon;
