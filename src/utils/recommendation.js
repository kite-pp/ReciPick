const DEFAULT_LIMIT = 8;
const ALL = '전체';

// 한국 시간 기준 오늘 날짜 'YYYY-MM-DD' (UTC로 자르면 자정 부근에 하루가 어긋난다)
const getTodayKst = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());

// 같은 ingredientId는 한 번만 센다 (먼저 나온 항목 유지)
const uniqueIngredients = (recipe) => [
  ...new Map(recipe.ingredients.map((item) => [item.ingredientId, item])).values(),
];

// 소비기한이 오늘보다 지난 재료는 보유로 치지 않는다 (오늘까지는 보유)
const getUsableIds = (fridgeIngredients, today) =>
  fridgeIngredients
    .filter((item) => !item.expiresAt || item.expiresAt >= today)
    .map((item) => item.ingredientId);

// 레시피 1개의 일치 정보 (상세·카드 배지용)
export function getRecipeMatch(recipe, fridgeIngredientIds) {
  const owned = new Set(fridgeIngredientIds);
  const needed = uniqueIngredients(recipe);
  const ownedIngredients = needed.filter((item) => owned.has(item.ingredientId));
  const missingIngredients = needed.filter((item) => !owned.has(item.ingredientId));
  const matchRate =
    needed.length === 0 ? 0 : Math.round((ownedIngredients.length / needed.length) * 100);

  return {
    matchRate,
    ownedIngredients,
    missingIngredients,
    isCookable: needed.length > 0 && missingIngredients.length === 0,
  };
}

const passesFilters = (recipe, { category, maxMinutes, difficulty }) => {
  if (category && category !== ALL && recipe.category !== category) return false;
  if (difficulty && difficulty !== ALL && recipe.difficulty !== difficulty) return false;
  if (maxMinutes && recipe.cookingTime > maxMinutes) return false;
  return true;
};

// 추천 목록 (추천 화면·냉장고 하단·홈 TODAY PICK용)
export function getRecommendations({
  recipes,
  fridgeIngredients,
  excludedIngredientIds = [],
  preferredCategories = [],
  filters = {},
  limit = DEFAULT_LIMIT,
  today = getTodayKst(),
}) {
  const usableIds = getUsableIds(fridgeIngredients, today);
  if (usableIds.length === 0) return []; // 빈 냉장고는 빈 배열

  const excluded = new Set(excludedIngredientIds);

  return recipes
    .filter((recipe) => passesFilters(recipe, filters))
    .filter((recipe) => !recipe.ingredients.some((item) => excluded.has(item.ingredientId)))
    .map((recipe) => ({ recipe, ...getRecipeMatch(recipe, usableIds) }))
    .sort((a, b) => {
      if (b.matchRate !== a.matchRate) return b.matchRate - a.matchRate;
      const aPreferred = preferredCategories.includes(a.recipe.category);
      const bPreferred = preferredCategories.includes(b.recipe.category);
      if (aPreferred !== bPreferred) return Number(bPreferred) - Number(aPreferred);
      return a.recipe.id - b.recipe.id; // 동률이면 id 오름차순 → 같은 입력은 항상 같은 결과
    })
    .slice(0, limit);
}
