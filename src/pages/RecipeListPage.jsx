import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { COOKING_TIME_FILTERS, DIFFICULTIES, RECIPE_CATEGORIES } from '../data/constants.js';
import { recipes } from '../data/recipes.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import styles from './RecipeListPage.module.css';

// 정렬 버튼 이름
const SORT_OPTIONS = ['일치율 높은순', '조리시간 짧은순', '난이도 낮은순'];

function RecipeListPage() {
  const { isFavorite, toggleFavorite } = useUserData();
  const requireLogin = useRequireLogin();

  const handleFavoriteClick = (recipeId) => {
    if (!requireLogin()) return; // 로그인 안 했으면 여기서 멈춤
    toggleFavorite(recipeId);
  };

  // 검색어, 카테고리, 난이도, 조리시간으로 필터링
  const filteredRecipes = recipes;

  // 필터 버튼 목록 (맨 앞에 '전체' 추가)
  const categoryOptions = ['전체', ...RECIPE_CATEGORIES];
  const difficultyOptions = ['전체', ...DIFFICULTIES];
  const timeOptions = ['전체', ...COOKING_TIME_FILTERS.map((filter) => filter.label)];

  return (
    <div className={styles.page}>
      {/* 제목 + 검색 */}
      <section className={styles.header}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true"></span>
          레시피 탐색
        </span>
        <h1 className={styles.title}>오늘은 어떤 요리를 해볼까요?</h1>
        <p className={styles.subtitle}>
          다양한 레시피를 검색하고 원하는 조리 조건과 보유 재료로 꼭 맞게 찾아보세요.
        </p>
        <SearchBar
          id="recipe-list-search"
          label="레시피 검색"
          placeholder="요리명 또는 재료를 검색해보세요"
        />
      </section>

      {/* 필터: 클릭하면 선택되고 목록이 걸러지게) */}
      <section className={styles.filterPanel} aria-label="레시피 필터">
        <div className={styles.categoryList}>
          {categoryOptions.map((category) => {
            const isActive = category === '전체';
            return (
              <button
                key={category}
                type="button"
                className={
                  isActive ? styles.category + ' ' + styles.categoryActive : styles.category
                }
                aria-pressed={isActive}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>난이도</span>
            <div className={styles.segment}>
              {difficultyOptions.map((difficulty) => {
                const isActive = difficulty === '전체';
                return (
                  <button
                    key={difficulty}
                    type="button"
                    className={
                      isActive
                        ? styles.segmentButton + ' ' + styles.segmentActive
                        : styles.segmentButton
                    }
                    aria-pressed={isActive}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>조리시간</span>
            <div className={styles.segment}>
              {timeOptions.map((time) => {
                const isActive = time === '전체';
                return (
                  <button
                    key={time}
                    type="button"
                    className={
                      isActive
                        ? styles.segmentButton + ' ' + styles.segmentActive
                        : styles.segmentButton
                    }
                    aria-pressed={isActive}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 개수 + 정렬: 정렬 동작) */}
      <div className={styles.summary}>
        <p className={styles.count}>총 {filteredRecipes.length}개의 레시피</p>
        <div className={styles.sortList}>
          {SORT_OPTIONS.map((option, index) => {
            const isActive = index === 0;
            return (
              <button
                key={option}
                type="button"
                className={
                  isActive ? styles.sortButton + ' ' + styles.sortActive : styles.sortButton
                }
                aria-pressed={isActive}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* 레시피 목록 (없으면 빈 상태) */}
      {filteredRecipes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="조건에 맞는 레시피가 없어요"
          description="검색어나 필터를 바꿔서 다시 찾아보세요."
        />
      ) : (
        <div className={styles.recipeGrid}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onFavoriteClick={() => handleFavoriteClick(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
