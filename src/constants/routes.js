export const ROUTES = Object.freeze({
  home: '/',
  recipes: '/recipes',
  recipeDetail: '/recipes/:id',
  login: '/login',
  signUp: '/signup',
  fridge: '/fridge',
  recommend: '/recommend',
  favorites: '/favorites',
  shoppingList: '/shopping-list',
  recent: '/recent',
  myPage: '/mypage',
});

// 헤더 가운데 메뉴 (Figma 공통 헤더와 같은 7개, 같은 순서)
export const PRIMARY_NAVIGATION_ITEMS = Object.freeze([
  { to: ROUTES.home, label: '홈' },
  { to: ROUTES.recipes, label: '레시피 탐색' },
  { to: ROUTES.fridge, label: '내 냉장고' },
  { to: ROUTES.recommend, label: '맞춤 추천' },
  { to: ROUTES.favorites, label: '찜한 레시피' },
  { to: ROUTES.shoppingList, label: '장보기' },
  { to: ROUTES.myPage, label: '마이페이지' },
]);

// 모바일 하단 메뉴 (칸이 좁아서 5개만. 장보기는 헤더 장바구니 버튼, 찜·최근 본은 마이페이지 바로가기로 이동)
export const MOBILE_NAVIGATION_ITEMS = Object.freeze([
  { to: ROUTES.home, label: '홈' },
  { to: ROUTES.recipes, label: '레시피' },
  { to: ROUTES.fridge, label: '냉장고' },
  { to: ROUTES.recommend, label: '추천' },
  { to: ROUTES.myPage, label: '마이페이지' },
]);
