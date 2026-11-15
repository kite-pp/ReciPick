import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { COOKING_TIME_FILTERS, DIFFICULTIES, RECIPE_CATEGORIES } from '../data/constants.js';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import { getRecipeMatch, getUsableIngredientIds } from '../utils/recommendation.js';
import styles from './RecipeListPage.module.css';

// 정렬 버튼 이름
const SORT_OPTIONS = ['일치율 높은순', '조리시간 짧은순', '난이도 낮은순'];

// 띄어쓰기 없애기 ('김치 볶음밥'으로 검색해도 '김치볶음밥'이 나오게)
function removeSpaces(text) {
  return text.replaceAll(' ', '');
}

// 레시피에 들어가는 재료 이름 목록 (검색용)
function getIngredientNames(recipe) {
  const names = [];
  for (const item of recipe.ingredients) {
    const ingredient = ingredients.find((ing) => ing.id === item.ingredientId);
    if (ingredient) {
      names.push(ingredient.name);
    }
  }
  return names;
}

function RecipeListPage() {
  const { fridgeIngredients, isFavorite, toggleFavorite } = useUserData();
  const requireLogin = useRequireLogin();
  const [searchParams, setSearchParams] = useSearchParams();

  // 헤더 검색창에서 넘어온 검색어 (/recipes?search=김치)
  const searchFromUrl = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(searchFromUrl);
  const [category, setCategory] = useState('전체');
  const [difficulty, setDifficulty] = useState('전체');
  const [time, setTime] = useState('전체');
  const [sort, setSort] = useState('일치율 높은순');

  // 이 화면에 있는 동안 헤더에서 다시 검색하면 검색창 글자도 바꿔주기
  const [prevSearchFromUrl, setPrevSearchFromUrl] = useState(searchFromUrl);
  if (searchFromUrl !== prevSearchFromUrl) {
    setPrevSearchFromUrl(searchFromUrl);
    setKeyword(searchFromUrl);
  }

  // 냉장고에 있는 재료 id (소비기한 지난 건 빼고, 추천 화면과 같은 기준)
  const myIngredientIds = getUsableIngredientIds(fridgeIngredients);

  const handleFavoriteClick = (recipeId) => {
    if (!requireLogin()) return; // 로그인 안 했으면 여기서 멈춤
    toggleFavorite(recipeId);
  };

  // 검색어, 필터, 정렬 전부 처음으로
  const handleReset = () => {
    setKeyword('');
    setCategory('전체');
    setDifficulty('전체');
    setTime('전체');
    setSort('일치율 높은순');
    setSearchParams({}); // 주소에 남은 ?search= 도 지우기
  };

  // 1. 검색어 + 필터로 걸러내기
  const searchText = removeSpaces(keyword.trim());
  const filteredRecipes = recipes.filter((recipe) => {
    // 검색어: 요리 이름이나 재료 이름에 들어 있으면 통과
    if (searchText !== '') {
      const inTitle = removeSpaces(recipe.title).includes(searchText);
      const inIngredients = getIngredientNames(recipe).some((name) =>
        removeSpaces(name).includes(searchText),
      );
      if (!inTitle && !inIngredients) return false;
    }

    if (category !== '전체' && recipe.category !== category) return false;
    if (difficulty !== '전체' && recipe.difficulty !== difficulty) return false;

    if (time !== '전체') {
      const timeFilter = COOKING_TIME_FILTERS.find((filter) => filter.label === time);
      if (recipe.cookingTime > timeFilter.maxMinutes) return false;
    }

    return true;
  });

  // 2. 정렬 (원본 배열이 바뀌지 않게 복사해서 정렬)
  const sortedRecipes = [...filteredRecipes];
  if (sort === '일치율 높은순') {
    // 냉장고가 비어 있으면(비로그인 포함) 전부 0%라 원래 순서 그대로
    sortedRecipes.sort(
      (a, b) =>
        getRecipeMatch(b, myIngredientIds).matchRate - getRecipeMatch(a, myIngredientIds).matchRate,
    );
  } else if (sort === '조리시간 짧은순') {
    sortedRecipes.sort((a, b) => a.cookingTime - b.cookingTime);
  } else if (sort === '난이도 낮은순') {
    // DIFFICULTIES = ['쉬움', '보통', '어려움'] 순서를 그대로 이용
    sortedRecipes.sort(
      (a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty),
    );
  }

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
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </section>

      {/* 필터 */}
      <section className={styles.filterPanel} aria-label="레시피 필터">
        <div className={styles.categoryRow}>
          <div className={styles.categoryList}>
            {categoryOptions.map((option) => {
              const isActive = option === category;
              return (
                <button
                  key={option}
                  type="button"
                  className={
                    isActive ? styles.category + ' ' + styles.categoryActive : styles.category
                  }
                  aria-pressed={isActive}
                  onClick={() => setCategory(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button type="button" className={styles.resetButton} onClick={handleReset}>
            필터 초기화
          </button>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>난이도</span>
            <div className={styles.segment}>
              {difficultyOptions.map((option) => {
                const isActive = option === difficulty;
                return (
                  <button
                    key={option}
                    type="button"
                    className={
                      isActive
                        ? styles.segmentButton + ' ' + styles.segmentActive
                        : styles.segmentButton
                    }
                    aria-pressed={isActive}
                    onClick={() => setDifficulty(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>조리시간</span>
            <div className={styles.segment}>
              {timeOptions.map((option) => {
                const isActive = option === time;
                return (
                  <button
                    key={option}
                    type="button"
                    className={
                      isActive
                        ? styles.segmentButton + ' ' + styles.segmentActive
                        : styles.segmentButton
                    }
                    aria-pressed={isActive}
                    onClick={() => setTime(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 개수 + 정렬 */}
      <div className={styles.summary}>
        <p className={styles.count}>총 {sortedRecipes.length}개의 레시피</p>
        <div className={styles.sortList}>
          {SORT_OPTIONS.map((option) => {
            const isActive = option === sort;
            return (
              <button
                key={option}
                type="button"
                className={
                  isActive ? styles.sortButton + ' ' + styles.sortActive : styles.sortButton
                }
                aria-pressed={isActive}
                onClick={() => setSort(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* 레시피 목록 (없으면 빈 상태) */}
      {sortedRecipes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="조건에 맞는 레시피가 없어요"
          description="검색어나 필터를 바꿔서 다시 찾아보세요."
        >
          <Button variant="secondary" onClick={handleReset}>
            필터 초기화
          </Button>
        </EmptyState>
      ) : (
        <div className={styles.recipeGrid}>
          {sortedRecipes.map((recipe) => (
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
