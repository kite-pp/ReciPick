export const ROUTES = Object.freeze({
  home: '/',
  recipes: '/recipes',
  recipeDetail: '/recipes/:id',
  fridge: '/fridge',
  recommend: '/recommend',
  favorites: '/favorites',
  shoppingList: '/shopping-list',
  recent: '/recent',
  myPage: '/mypage',
});

export const PRIMARY_NAVIGATION_ITEMS = Object.freeze([
  { to: ROUTES.recommend, label: '식재료 추천' },
  { to: ROUTES.fridge, label: '내 냉장고 관리' },
  { to: ROUTES.recipes, label: '레시피 탐색' },
  { to: ROUTES.favorites, label: '찜한 레시피' },
]);
