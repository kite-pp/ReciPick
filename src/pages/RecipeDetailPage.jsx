import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import styles from './RecipeDetailPage.module.css';

const SIMILAR_RECIPE_COUNT = 3;
const SEASONING_CATEGORY = '양념';

const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = recipes.find((item) => item.id === Number(id));

  const { user } = useAuth();
  const { isFavorite, toggleFavorite, addRecentlyViewed } = useUserData();
  const requireLogin = useRequireLogin();

  // 로그인 사용자가 존재하는 레시피를 열면 최근 본 레시피에 기록합니다.
  const recipeId = recipe?.id;
  useEffect(() => {
    if (user && recipeId !== undefined) addRecentlyViewed(recipeId);
  }, [user, recipeId, addRecentlyViewed]);

  if (!recipe) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="🍽️"
          title="레시피를 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 레시피입니다."
        />
      </div>
    );
  }

  const recipeIngredients = recipe.ingredients.map((item) => ({
    ...item,
    info: ingredientMap.get(item.ingredientId),
  }));
  const mainList = recipeIngredients.filter((item) => item.info?.category !== SEASONING_CATEGORY);
  const seasoningList = recipeIngredients.filter(
    (item) => item.info?.category === SEASONING_CATEGORY,
  );

  // 골격 - 계산 없이 현재 레시피를 제외한 앞 3개를 표시
  const similarRecipes = recipes
    .filter((item) => item.id !== recipe.id)
    .slice(0, SIMILAR_RECIPE_COUNT);

  const handleFavoriteClick = (targetId) => {
    if (!requireLogin()) return;
    toggleFavorite(targetId);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="현재 위치">
        <Link to={ROUTES.home}>홈</Link>
        <span aria-hidden="true">›</span>
        <Link to={ROUTES.recipes}>레시피 탐색</Link>
        <span aria-hidden="true">›</span>
        <span>{recipe.category}</span>
        <span aria-hidden="true">›</span>
        <strong>{recipe.title}</strong>
      </nav>

      {/* 상단 정보 */}
      <section className={styles.hero}>
        <img className={styles.heroImage} src={recipe.image} alt={recipe.title} />
        <div className={styles.heroInfo}>
          <Badge>{recipe.category}</Badge>
          <h1 className={styles.title}>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>조리 시간</dt>
              <dd>{recipe.cookingTime}분</dd>
            </div>
            <div className={styles.stat}>
              <dt>난이도</dt>
              <dd>{recipe.difficulty}</dd>
            </div>
            <div className={styles.stat}>
              <dt>분량</dt>
              <dd>{recipe.servings}인분</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => handleFavoriteClick(recipe.id)}
              aria-pressed={isFavorite(recipe.id)}
            >
              {isFavorite(recipe.id) ? '♥ 찜 해제' : '♡ 찜하기'}
            </Button>
            <Button variant="secondary" disabled>
              부족한 재료 담기
            </Button>
          </div>
        </div>
      </section>

      {/* 냉장고 일치 카드 - 골격 */}
      <section className={styles.matchCard} aria-label="냉장고 재료 일치율">
        <h2 className={styles.matchTitle}>내 냉장고 재료와의 일치율</h2>
        <p className={styles.matchDescription}>
          냉장고 재료와 비교한 일치율과 부족한 재료는 추후 추천 기능에서 표시됩니다.
        </p>
      </section>

      {/* 전체 재료 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>전체 식재료 목록</h2>
        <div className={styles.ingredientGroups}>
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>
              주재료 <span>{mainList.length}종</span>
            </h3>
            {mainList.length === 0 ? (
              <p className={styles.emptyText}>등록된 주재료가 없어요.</p>
            ) : (
              <ul className={styles.groupList}>
                {mainList.map((item) => (
                  <li key={item.ingredientId}>
                    <span>{item.info?.name}</span>
                    <span>{item.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>
              양념 <span>{seasoningList.length}종</span>
            </h3>
            {seasoningList.length === 0 ? (
              <p className={styles.emptyText}>양념이 필요 없는 레시피예요.</p>
            ) : (
              <ul className={styles.groupList}>
                {seasoningList.map((item) => (
                  <li key={item.ingredientId}>
                    <span>{item.info?.name}</span>
                    <span>{item.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 조리 순서 */}
      <section className={styles.section}>
        <div className={styles.stepsHeader}>
          <span className={styles.stepsBadge}>COOKING STEPS</span>
          <span className={styles.stepsTime}>총 소요시간 {recipe.cookingTime}분</span>
        </div>
        <h2 className={styles.sectionTitle}>단계별 요리 가이드</h2>
        {recipe.steps.length === 0 ? (
          <p className={styles.emptyText}>등록된 조리 순서가 없어요.</p>
        ) : (
          <ol className={styles.stepList}>
            {recipe.steps.map((step, index) => (
              <li key={step} className={styles.step}>
                <h3 className={styles.stepTitle}>{index + 1}단계</h3>
                <p className={styles.stepText}>{step}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 비슷한 레시피 - 골격 */}
      {similarRecipes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>비슷한 레시피</h2>
          <div className={styles.recipeGrid}>
            {similarRecipes.map((item) => (
              <RecipeCard
                key={item.id}
                recipe={item}
                isFavorite={isFavorite(item.id)}
                onFavoriteClick={() => handleFavoriteClick(item.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default RecipeDetailPage;
