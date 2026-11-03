import { Link } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { recipes } from '../data/recipes.js';
import styles from './SavedRecipes.module.css';

function RecentlyViewedPage() {
  const { recentRecipes, isFavorite, toggleFavorite } = useUserData();

  // 최근에 본 순서대로 레시피 찾기 (최대 10개는 Context에서 관리)
  const viewedRecipes = [];
  for (const id of recentRecipes) {
    const recipe = recipes.find((item) => item.id === id);
    if (recipe) {
      viewedRecipes.push(recipe);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <span className={styles.badge}>RECENTLY VIEWED</span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>최근 본 레시피</h1>
          <span className={styles.countPill}>
            <span className={styles.countDot} aria-hidden="true"></span>
            <strong>{viewedRecipes.length}개</strong> · 최대 10개까지 최신순으로 저장돼요
          </span>
        </div>
        <p className={styles.description}>최근 확인한 메뉴를 최신순으로 다시 살펴보세요.</p>
      </section>

      {viewedRecipes.length === 0 ? (
        <EmptyState
          icon="🕒"
          title="최근 본 레시피가 없어요"
          description="레시피 상세 페이지를 열면 이곳에 자동으로 기록돼요."
        >
          <Link className={styles.emptyLink} to={ROUTES.recipes}>
            레시피 둘러보기
          </Link>
        </EmptyState>
      ) : (
        <div className={styles.recipeGrid}>
          {viewedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onFavoriteClick={() => toggleFavorite(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentlyViewedPage;
