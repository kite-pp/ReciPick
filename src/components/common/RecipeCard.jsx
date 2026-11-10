import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import styles from './RecipeCard.module.css';

// 레시피 카드 (홈, 레시피 목록, 추천, 찜, 최근 본에서 공통 사용)
// 사용 예시
// <RecipeCard recipe={recipe} />
// <RecipeCard
//   recipe={recipe}
//   matchRate={92}                    // 있으면 "내 재료 92% 일치" 배지
//   missingIngredients={['두부']}     // 있으면 "부족한 재료: 두부" (빈 배열이면 "모든 재료 준비")
//   isFavorite={isFavorite(recipe.id)}
//   onFavoriteClick={() => handleFavorite(recipe.id)}
// />
// recipe는 src/data/recipes.js의 레시피 객체 하나
// 찜 버튼 로그인 체크는 이 카드를 쓰는 페이지에서 useRequireLogin으로
function RecipeCard({
  recipe,
  matchRate,
  missingIngredients,
  isFavorite = false,
  onFavoriteClick,
}) {
  // 부족한 재료 문구 (missingIngredients를 안 넘기면 문구 없음)
  let missingText = '';
  if (missingIngredients) {
    if (missingIngredients.length === 0) {
      missingText = '모든 필수 재료가 냉장고에 준비되어 있어요';
    } else {
      missingText = '부족한 재료: ' + missingIngredients.join(', ');
    }
  }

  const detailPath = ROUTES.recipeDetail.replace(':id', recipe.id);

  return (
    <article className={styles.card}>
      <div className={styles.imageBox}>
        <img className={styles.image} src={recipe.image} alt={recipe.title} />
        {matchRate !== undefined && (
          <span className={styles.matchBadge}>내 재료 {matchRate}% 일치</span>
        )}
        <button
          type="button"
          className={styles.favoriteButton}
          onClick={onFavoriteClick}
          aria-label={isFavorite ? recipe.title + ' 찜 해제' : recipe.title + ' 찜하기'}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{recipe.category}</p>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.description}>{recipe.description}</p>
        <ul className={styles.infoList}>
          <li className={styles.info}>⏱ {recipe.cookingTime}분</li>
          <li className={styles.info}>{recipe.difficulty}</li>
          <li className={styles.info}>{recipe.servings}인분</li>
        </ul>

        <div className={styles.footer}>
          {missingText && <p className={styles.missing}>{missingText}</p>}
          <Link className={styles.detailLink} to={detailPath}>
            레시피 보기 →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RecipeCard;
