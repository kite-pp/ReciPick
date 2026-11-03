import { Link } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { recipes } from '../data/recipes.js';
import styles from './SavedRecipes.module.css';

function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useUserData();

  // 찜한 순서(최근순서 정렬)대로 레시피 찾기
  const favoriteRecipes = [];
  for (const id of favorites) {
    const recipe = recipes.find((item) => item.id === id);
    if (recipe) {
      favoriteRecipes.push(recipe);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <span className={styles.badge}>나의 쿠킹 아카이브</span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>찜한 레시피</h1>
          <span className={styles.countPill}>
            <span className={styles.countDot} aria-hidden="true"></span>총{' '}
            <strong>{favoriteRecipes.length}개</strong>의 레시피를 저장했어요
          </span>
        </div>
        <p className={styles.description}>나중에 만들어보고 싶은 레시피를 모아봤어요.</p>
      </section>

      {favoriteRecipes.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="찜한 레시피가 없어요"
          description="마음에 드는 레시피에 하트를 눌러보세요."
        >
          <Link className={styles.emptyLink} to={ROUTES.recipes}>
            레시피 둘러보기
          </Link>
        </EmptyState>
      ) : (
        <div className={styles.recipeGrid}>
          {favoriteRecipes.map((recipe) => (
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

export default FavoritesPage;
