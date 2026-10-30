import { Link } from 'react-router-dom';

import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { recipes } from '../data/recipes.js';
import styles from './HomePage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { useRequireLogin } from '../hooks/useRequireLogin.js';

// 바로가기 카드 3개 내용
const QUICK_LINKS = [
  { to: ROUTES.fridge, title: '내 냉장고 관리', text: '가지고 있는 식재료를 등록하고 삭제해요.' },
  {
    to: ROUTES.recommend,
    title: '맞춤 레시피 추천',
    text: '보유 재료와 일치율이 높은 레시피를 찾아요.',
  },
  {
    to: ROUTES.shoppingList,
    title: '장보기 목록',
    text: '부족한 재료만 모아서 체크리스트로 관리해요.',
  },
];

function HomePage() {
  // TODO: 추천 계산 함수(#41)가 나오면 일치율 높은 순으로 바꾸기. 지금은 앞에서 3개
  const todayRecipes = recipes.slice(0, 3);
  const { isFavorite, toggleFavorite } = useUserData();
  const requireLogin = useRequireLogin();

  const handleFavoriteClick = (recipeId) => {
    if (!requireLogin()) return; // 로그인 안 했으면 여기서 멈춤
    toggleFavorite(recipeId);
  };

  return (
    <div className={styles.home}>
      {/* 히어로 */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>냉장고 기반 맞춤 레시피</span>
        <h1 className={styles.heroTitle}>오늘 뭐 먹지?</h1>
        <p className={styles.heroText}>
          냉장고 속 재료를 등록하면 지금 만들 수 있는 레시피를 추천해드려요.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.primaryLink} to={ROUTES.fridge}>
            내 냉장고 등록하기
          </Link>
          <Link className={styles.secondaryLink} to={ROUTES.recipes}>
            레시피 둘러보기
          </Link>
        </div>
      </section>

      {/* 바로가기 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>QUICK START</p>
          <h2 className={styles.sectionTitle}>필요한 기능으로 바로 이동하세요</h2>
          <p className={styles.sectionText}>
            재료 관리부터 추천, 장보기까지 한 흐름으로 연결됩니다.
          </p>
        </div>
        <div className={styles.quickGrid}>
          {QUICK_LINKS.map((item) => (
            <Link key={item.to} className={styles.quickCard} to={item.to}>
              <span className={styles.quickTitle}>{item.title}</span>
              <span className={styles.quickText}>{item.text}</span>
              <span className={styles.quickMore}>바로가기 →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 오늘의 추천 레시피 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>TODAY PICK</p>
          <h2 className={styles.sectionTitle}>오늘의 추천 레시피</h2>
          <p className={styles.sectionText}>지금 냉장고 재료와 잘 맞는 메뉴예요.</p>
        </div>
        <div className={styles.recipeGrid}>
          {todayRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onFavoriteClick={() => handleFavoriteClick(recipe.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
