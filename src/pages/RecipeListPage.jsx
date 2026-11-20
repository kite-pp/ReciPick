import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { COOKING_TIME_FILTERS, DIFFICULTIES, RECIPE_CATEGORIES } from '../data/constants.js';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import { getRecipeMatch, getUsableIngredientIds } from '../utils/recommendation.js';
import styles from './RecipeListPage.module.css';

// 정렬 버튼 이름
const SORT_OPTIONS = ['일치율 높은순', '조리시간 짧은순', '난이도 낮은순'];

// 한 번에 보여줄 레시피 개수 (더보기 누르면 이만큼 더)
const PAGE_SIZE = 12;

// 검색 결과 없을 때 보여줄 추천 검색어
const SEARCH_SUGGESTIONS = [
  { label: '김치', keyword: '김치' },
  { label: '달걀', keyword: '달걀' },
  { label: '돼지고기', keyword: '돼지고기' },
  { label: '15분 요리', time: '15분 이하' },
];

// 재료 id로 이름 찾기용 (상세·추천 화면과 같은 방식)
const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

function getIngredientName(ingredientId) {
  const ingredient = ingredientMap.get(ingredientId);
  return ingredient ? ingredient.name : '';
}

// 띄어쓰기 없애기 ('김치 볶음밥'으로 검색해도 '김치볶음밥'이 나오게)
function removeSpaces(text) {
  return text.replaceAll(' ', '');
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
  const [onlyMine, setOnlyMine] = useState(false); // 내 재료 우선 매칭 토글
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 이 화면에 있는 동안 헤더에서 다시 검색하면 검색창 글자도 바꿔주기
  const [prevSearchFromUrl, setPrevSearchFromUrl] = useState(searchFromUrl);
  if (searchFromUrl !== prevSearchFromUrl) {
    setPrevSearchFromUrl(searchFromUrl);
    setKeyword(searchFromUrl);
  }

  // 냉장고에 있는 재료 id (소비기한 지난 건 빼고, 추천 화면과 같은 기준)
  const myIngredientIds = getUsableIngredientIds(fridgeIngredients);
  const hasFridge = myIngredientIds.length > 0;

  // 레시피마다 일치 정보 미리 계산해두기 { 레시피 id: { matchRate, missingIngredients, ... } }
  const matchById = {};
  for (const recipe of recipes) {
    matchById[recipe.id] = getRecipeMatch(recipe, myIngredientIds);
  }

  // 카드에 넘길 일치율·부족 재료 (냉장고가 비어 있으면 배지 안 보이게 빈 객체)
  function getCardMatchProps(recipe) {
    if (!hasFridge) return {};
    const match = matchById[recipe.id];
    return {
      matchRate: match.matchRate,
      missingIngredients: match.missingIngredients.map((item) =>
        getIngredientName(item.ingredientId),
      ),
    };
  }

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
    setOnlyMine(false);
    setVisibleCount(PAGE_SIZE);
    setSearchParams({}); // 주소에 남은 ?search= 도 지우기
  };

  // 추천 검색어 칩 클릭
  const handleSuggestionClick = (suggestion) => {
    setCategory('전체');
    setDifficulty('전체');
    setOnlyMine(false);
    if (suggestion.keyword) {
      setTime('전체');
      setKeyword(suggestion.keyword);
      setSearchParams({ search: suggestion.keyword }); // 주소도 같이 바꿔야 검색어가 안 지워짐
    } else {
      setTime(suggestion.time);
      setKeyword('');
      setSearchParams({});
    }
  };

  // 1. 검색어 + 필터로 걸러내기
  const searchText = removeSpaces(keyword.trim());
  const filteredRecipes = recipes.filter((recipe) => {
    // 검색어: 요리 이름이나 재료 이름에 들어 있으면 통과
    if (searchText !== '') {
      const inTitle = removeSpaces(recipe.title).includes(searchText);
      const inIngredients = recipe.ingredients.some((item) =>
        removeSpaces(getIngredientName(item.ingredientId)).includes(searchText),
      );
      if (!inTitle && !inIngredients) return false;
    }

    if (category !== '전체' && recipe.category !== category) return false;
    if (difficulty !== '전체' && recipe.difficulty !== difficulty) return false;

    if (time !== '전체') {
      const timeFilter = COOKING_TIME_FILTERS.find((filter) => filter.label === time);
      if (recipe.cookingTime > timeFilter.maxMinutes) return false;
    }

    // 내 재료 우선 매칭: 내 재료가 하나도 안 들어간 레시피는 빼기
    if (onlyMine && hasFridge && matchById[recipe.id].matchRate === 0) return false;

    return true;
  });

  // 2. 정렬 (원본 배열이 바뀌지 않게 복사해서 정렬)
  const sortedRecipes = [...filteredRecipes];
  if (sort === '일치율 높은순') {
    // 냉장고가 비어 있으면(비로그인 포함) 전부 0%라 원래 순서 그대로
    sortedRecipes.sort((a, b) => matchById[b.id].matchRate - matchById[a.id].matchRate);
  } else if (sort === '조리시간 짧은순') {
    sortedRecipes.sort((a, b) => a.cookingTime - b.cookingTime);
  } else if (sort === '난이도 낮은순') {
    // DIFFICULTIES = ['쉬움', '보통', '어려움'] 순서를 그대로 이용
    sortedRecipes.sort(
      (a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty),
    );
  }

  // 3. 더보기: 앞에서부터 visibleCount개만 보여주기
  const visibleRecipes = sortedRecipes.slice(0, visibleCount);
  const remainCount = sortedRecipes.length - visibleRecipes.length;

  // 검색 결과 없을 때 "이런 레시피는 어떠세요?" (일치율 높은 3개, 냉장고 비었으면 앞에서 3개)
  const suggestedRecipes = [...recipes]
    .sort((a, b) => matchById[b.id].matchRate - matchById[a.id].matchRate)
    .slice(0, 3);

  // 하단 "내 냉장고 속 식재료" 문구 (5개까지만 보여주고 나머지는 "외 n개")
  const fridgeNames = myIngredientIds.map((id) => getIngredientName(id));
  let fridgeText = fridgeNames.slice(0, 5).join(', ');
  if (fridgeNames.length > 5) {
    fridgeText += ' 외 ' + (fridgeNames.length - 5) + '개';
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

          {/* 내 재료 우선 매칭 토글 (냉장고가 비어 있으면 못 누름) */}
          <div className={styles.matchToggle}>
            <div className={styles.matchText}>
              <span className={styles.matchTitle}>내 재료 우선 매칭</span>
              <span className={styles.matchDescription}>
                {hasFridge
                  ? '보유재료 ' + myIngredientIds.length + '개 연동 중'
                  : '냉장고에 재료를 등록해 주세요'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={onlyMine}
              aria-label="내 재료가 들어간 레시피만 보기"
              disabled={!hasFridge}
              className={onlyMine ? styles.switch + ' ' + styles.switchOn : styles.switch}
              onClick={() => setOnlyMine(!onlyMine)}
            >
              <span className={styles.switchKnob} aria-hidden="true"></span>
            </button>
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

      {/* 레시피 목록 (없으면 검색 결과 없음 화면) */}
      {sortedRecipes.length === 0 ? (
        <>
          <EmptyState
            icon="🔍"
            title={
              keyword.trim() !== ''
                ? '‘' + keyword.trim() + '’ 검색 결과가 없어요'
                : '조건에 맞는 레시피가 없어요'
            }
            description="검색어를 줄이거나 다른 재료명으로 다시 검색해보세요."
          >
            <div className={styles.suggestionList}>
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  className={styles.suggestionChip}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
            <Button onClick={handleReset}>전체 레시피 보기</Button>
          </EmptyState>

          <section className={styles.suggestSection}>
            <h2 className={styles.suggestTitle}>이런 레시피는 어떠세요?</h2>
            <div className={styles.recipeGrid}>
              {suggestedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  {...getCardMatchProps(recipe)}
                  isFavorite={isFavorite(recipe.id)}
                  onFavoriteClick={() => handleFavoriteClick(recipe.id)}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className={styles.recipeGrid}>
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                {...getCardMatchProps(recipe)}
                isFavorite={isFavorite(recipe.id)}
                onFavoriteClick={() => handleFavoriteClick(recipe.id)}
              />
            ))}
          </div>

          {/* 더보기 (남은 레시피가 있을 때만) */}
          {remainCount > 0 && (
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
            >
              ⌄ 레시피 더보기 (+{Math.min(PAGE_SIZE, remainCount)})
            </button>
          )}
        </>
      )}

      {/* 하단 내 냉장고 속 식재료 (냉장고에 재료가 있을 때만) */}
      {hasFridge && (
        <aside className={styles.fridgeDock} aria-label="내 냉장고 속 식재료">
          <span className={styles.fridgeIcon} aria-hidden="true">
            🧊
          </span>
          <div className={styles.fridgeText}>
            <strong className={styles.fridgeTitle}>내 냉장고 속 식재료</strong>
            <span className={styles.fridgeNames}>{fridgeText}</span>
          </div>
          <Link className={styles.fridgeLink} to={ROUTES.fridge}>
            냉장고 수정
          </Link>
        </aside>
      )}
    </div>
  );
}

export default RecipeListPage;
