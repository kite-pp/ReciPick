const STORAGE_PREFIX = 'recipick';

export const STORAGE_KEYS = Object.freeze({
  fridgeIngredients: `${STORAGE_PREFIX}.fridgeIngredients`,
  favorites: `${STORAGE_PREFIX}.favorites`,
  recentRecipes: `${STORAGE_PREFIX}.recentRecipes`,
  shoppingList: `${STORAGE_PREFIX}.shoppingList`,
});

// 계정별로 데이터를 나누기 위해 사용자 id를 붙입니다. (예: recipick.favorites.<userId>)
// 로그인하지 않았으면 null을 돌려주고, 이때는 저장하지 않습니다.
export function getUserStorageKey(storageKey, userId) {
  return userId ? `${storageKey}.${userId}` : null;
}
