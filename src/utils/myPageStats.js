import { recipes } from '../data/recipes.js';

const MAX_CATEGORY_ROWS = 4;

// 이번 주 월요일 00:00 (로컬 시간)
function getWeekStart(now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

// 이번 주(월요일부터)에 냉장고에 추가한 재료 수
export function countAddedThisWeek(fridgeIngredients, now = new Date()) {
  const weekStart = getWeekStart(now);
  return fridgeIngredients.filter((item) => item.addedAt && new Date(item.addedAt) >= weekStart)
    .length;
}

// 레시피 id 목록의 카테고리별 개수를 많은 순으로 반환합니다. 같은 개수면 먼저 등장한 카테고리가 앞에 옵니다.
function countCategories(recipeIds) {
  const counts = new Map();
  recipeIds.forEach((id) => {
    const recipe = recipes.find((item) => item.id === id);
    if (!recipe) return;
    counts.set(recipe.category, (counts.get(recipe.category) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// 가장 많이 찜한 카테고리 (찜한 레시피가 없으면 null)
export function getTopFavoriteCategory(favoriteIds) {
  return countCategories(favoriteIds)[0]?.category ?? null;
}

// 즐겨찾기와 최근 본 레시피(중복 제외)를 기준으로 상위 카테고리 비율을 계산합니다.
export function getCategoryRatios(favoriteIds, recentIds) {
  const uniqueIds = [...new Set([...favoriteIds, ...recentIds])];
  const counts = countCategories(uniqueIds);
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return [];

  return counts.slice(0, MAX_CATEGORY_ROWS).map((item) => ({
    category: item.category,
    percent: Math.round((item.count / total) * 100),
  }));
}
