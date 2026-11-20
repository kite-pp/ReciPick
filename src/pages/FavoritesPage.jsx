import { useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { RECIPE_CATEGORIES } from '../data/constants.js';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { getRecipeMatch, getUsableIngredientIds } from '../utils/recommendation.js';
import styles from './SavedRecipes.module.css';

// 정렬 옵션
const SORT_OPTIONS = ['최근 저장순', '일치율 높은순', '조리시간 짧은순'];

// 재료 id로 이름 찾기용 (상세·추천·목록 화면과 같은 방식)
const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

function FavoritesPage() {
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    fridgeIngredients,
    isInShoppingList,
    addShoppingItems,
  } = useUserData();

  const [category, setCategory] = useState('전체');
  const [onlyCookable, setOnlyCookable] = useState(false); // 즉시 조리 가능만
  const [sort, setSort] = useState('최근 저장순');
  const [selectedIds, setSelectedIds] = useState([]); // 선택한 레시피 id 목록
  const [message, setMessage] = useState(''); // 장보기 담은 결과 안내

  // 찜한 순서(최근에 찜한 게 앞)대로 레시피 찾기
  const favoriteRecipes = [];
  for (const id of favorites) {
    const recipe = recipes.find((item) => item.id === id);
    if (recipe) {
      favoriteRecipes.push(recipe);
    }
  }

  // 냉장고 재료 기준 일치 정보 (추천·목록 화면과 같은 기준)
  const myIngredientIds = getUsableIngredientIds(fridgeIngredients);
  const hasFridge = myIngredientIds.length > 0;
  const matchById = {};
  for (const recipe of favoriteRecipes) {
    matchById[recipe.id] = getRecipeMatch(recipe, myIngredientIds);
  }

  // 카테고리 버튼 (찜한 레시피가 있는 카테고리만, 개수 포함)
  const categoryOptions = [{ name: '전체', count: favoriteRecipes.length }];
  for (const name of RECIPE_CATEGORIES) {
    const count = favoriteRecipes.filter((recipe) => recipe.category === name).length;
    if (count > 0) {
      categoryOptions.push({ name, count });
    }
  }

  // 1. 카테고리 + 즉시 조리 가능만 걸러내기
  const filteredRecipes = favoriteRecipes.filter((recipe) => {
    if (category !== '전체' && recipe.category !== category) return false;
    if (onlyCookable && !matchById[recipe.id].isCookable) return false;
    return true;
  });

  // 2. 정렬 (최근 저장순은 찜한 순서 그대로)
  const sortedRecipes = [...filteredRecipes];
  if (sort === '일치율 높은순') {
    sortedRecipes.sort((a, b) => matchById[b.id].matchRate - matchById[a.id].matchRate);
  } else if (sort === '조리시간 짧은순') {
    sortedRecipes.sort((a, b) => a.cookingTime - b.cookingTime);
  }

  // 화면에 보이는 레시피 중에서 선택된 것만 (찜 해제·필터로 사라진 건 빼기)
  const selectedRecipes = sortedRecipes.filter((recipe) => selectedIds.includes(recipe.id));
  const isAllSelected = sortedRecipes.length > 0 && selectedRecipes.length === sortedRecipes.length;

  // 카드 하나 선택/해제
  const handleSelect = (recipeId) => {
    if (selectedIds.includes(recipeId)) {
      setSelectedIds(selectedIds.filter((id) => id !== recipeId));
    } else {
      setSelectedIds([...selectedIds, recipeId]);
    }
    setMessage('');
  };

  // 전체 선택 / 선택 해제
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedRecipes.map((recipe) => recipe.id));
    }
    setMessage('');
  };

  // 선택한 레시피의 부족한 재료를 장보기 목록에 한 번에 담기
  const handleAddToShopping = async () => {
    const ingredientIds = [];
    for (const recipe of selectedRecipes) {
      for (const item of matchById[recipe.id].missingIngredients) {
        // 이미 장보기에 있거나, 다른 레시피에서 이미 넣은 재료는 빼기 (중복 방지)
        if (!isInShoppingList(item.ingredientId) && !ingredientIds.includes(item.ingredientId)) {
          ingredientIds.push(item.ingredientId);
        }
      }
    }

    if (ingredientIds.length === 0) {
      setMessage('새로 담을 재료가 없어요. 이미 장보기 목록에 있거나 냉장고에 다 있어요.');
      return;
    }

    await addShoppingItems(ingredientIds);
    setMessage('장보기 목록에 재료 ' + ingredientIds.length + '개를 담았어요.');
    setSelectedIds([]);
  };

  // 카드에 넘길 일치율·부족 재료 (냉장고가 비어 있으면 배지 안 보이게 빈 객체)
  function getCardMatchProps(recipe) {
    if (!hasFridge) return {};
    const match = matchById[recipe.id];
    return {
      matchRate: match.matchRate,
      missingIngredients: match.missingIngredients.map(
        (item) => ingredientMap.get(item.ingredientId)?.name,
      ),
    };
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <section className={styles.header}>
          <span className={styles.badge}>나의 쿠킹 아카이브</span>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>찜한 레시피</h1>
            <span className={styles.countPill}>
              <span className={styles.countDot} aria-hidden="true"></span>총{' '}
              <strong>{favoriteRecipes.length}개</strong>의 레시피를 저장했어요
            </span>
          </div>
          <p className={styles.description}>
            나중에 만들어보고 싶은 레시피를 모아봤어요. 냉장고 식재료와 실시간으로 매칭됩니다.
          </p>
        </section>

        {favoriteRecipes.length > 0 && (
          <div className={styles.actionButtons}>
            <button type="button" className={styles.clearButton} onClick={handleSelectAll}>
              {isAllSelected ? '선택 해제' : '전체 선택'}
            </button>
            <button
              type="button"
              className={styles.bulkButton}
              onClick={handleAddToShopping}
              disabled={selectedRecipes.length === 0}
            >
              일괄 장보기 담기 ({selectedRecipes.length})
            </button>
          </div>
        )}
      </div>

      {/* 장보기 담기 결과 안내 */}
      {message && (
        <p className={styles.message} role="status">
          {message}{' '}
          <Link className={styles.messageLink} to={ROUTES.shoppingList}>
            장보기 목록 보기
          </Link>
        </p>
      )}

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
        <>
          {/* 필터 + 정렬 */}
          <div className={styles.toolbar}>
            <div className={styles.categoryList}>
              {categoryOptions.map((option) => {
                const isActive = option.name === category;
                return (
                  <button
                    key={option.name}
                    type="button"
                    className={
                      isActive ? styles.category + ' ' + styles.categoryActive : styles.category
                    }
                    aria-pressed={isActive}
                    onClick={() => setCategory(option.name)}
                  >
                    {option.name} <span className={styles.categoryCount}>{option.count}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.toolbarRight}>
              <label className={styles.cookableCheck}>
                <input
                  type="checkbox"
                  checked={onlyCookable}
                  onChange={(event) => setOnlyCookable(event.target.checked)}
                />
                즉시 조리 가능만
              </label>
              <label className={styles.srOnly} htmlFor="favorite-sort">
                정렬
              </label>
              <select
                id="favorite-sort"
                className={styles.sortSelect}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sortedRecipes.length === 0 ? (
            <EmptyState
              icon="🍳"
              title="조건에 맞는 찜한 레시피가 없어요"
              description="카테고리를 바꾸거나 '즉시 조리 가능만'을 해제해 보세요."
            />
          ) : (
            <div className={styles.recipeGrid}>
              {sortedRecipes.map((recipe) => (
                <div key={recipe.id} className={styles.selectableCard}>
                  <label className={styles.selectCheck}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(recipe.id)}
                      onChange={() => handleSelect(recipe.id)}
                    />
                    <span className={styles.srOnly}>{recipe.title} 선택</span>
                  </label>
                  <RecipeCard
                    recipe={recipe}
                    {...getCardMatchProps(recipe)}
                    isFavorite={isFavorite(recipe.id)}
                    onFavoriteClick={() => toggleFavorite(recipe.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FavoritesPage;
