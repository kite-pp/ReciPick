import { Link } from 'react-router-dom';

import profileAvatar from '../../assets/common/profile-avatar.png';
import { ROUTES } from '../../constants/routes.js';
import {
  countAddedThisWeek,
  getCategoryRatios,
  getTopFavoriteCategory,
} from '../../utils/myPageStats.js';
import styles from './MyPageSummary.module.css';

// 순위별 막대 색 (Figma 기준: 1위 검정, 2위 노랑, 3위 초록, 4위 회색)
const BAR_COLORS = [
  'var(--color-primary)',
  '#fab82e',
  'var(--color-success)',
  'var(--color-disabled)',
];

const SHORTCUTS = [
  { to: ROUTES.fridge, title: '내 냉장고', description: '보유 식재료 관리' },
  { to: ROUTES.favorites, title: '찜한 레시피', description: '저장한 메뉴 모아보기' },
  { to: ROUTES.recent, title: '최근 본 레시피', description: '최근 활동 다시 보기' },
  { to: ROUTES.shoppingList, title: '장보기 목록', description: '부족한 재료 체크하기' },
];

// 마이페이지 상단 요약 영역
// 사용 예시
// <MyPageSummary userName="준호" fridgeIngredients={[...]} favorites={[1, 2]} recentRecipes={[3]} shoppingCount={5} />
function MyPageSummary({ userName, fridgeIngredients, favorites, recentRecipes, shoppingCount }) {
  const addedThisWeek = countAddedThisWeek(fridgeIngredients);
  const topFavoriteCategory = getTopFavoriteCategory(favorites);
  const categoryRatios = getCategoryRatios(favorites, recentRecipes);

  // 요약 카드 4개
  const stats = [
    {
      label: '냉장고 재료',
      value: fridgeIngredients.length,
      caption: `이번 주 +${addedThisWeek}`,
    },
    {
      label: '즐겨찾기',
      value: favorites.length,
      caption: topFavoriteCategory ? `가장 많이 찜한 ${topFavoriteCategory}` : '찜한 레시피',
    },
    { label: '최근 본 레시피', value: recentRecipes.length, caption: '최대 10개까지 저장' },
    { label: '장보기 목록', value: shoppingCount, caption: '구매 전 항목' },
  ];

  return (
    <section className={styles.summary}>
      <div className={styles.header}>
        <span className={styles.badge}>MY RECIPICK</span>
        <h1 className={styles.title}>마이페이지</h1>
        <p className={styles.subtitle}>냉장고와 레시피 활동을 한눈에 확인하세요.</p>
      </div>

      <div className={styles.profileCard}>
        <img className={styles.avatar} src={profileAvatar} alt="" />
        <div className={styles.profileText}>
          <p className={styles.profileName}>{userName}님의 ReciPick</p>
          <p className={styles.profileDescription}>
            냉장고를 채우고, 취향에 맞는 레시피를 모아보세요.
          </p>
        </div>
        <Link className={styles.fridgeLink} to={ROUTES.fridge}>
          내 냉장고 보기
        </Link>
      </div>

      <div className={styles.statGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statLabel}>{stat.label}</span>
            <strong className={styles.statValue}>{stat.value}개</strong>
            <span className={styles.statCaption}>{stat.caption}</span>
          </div>
        ))}
      </div>

      <div className={styles.columns}>
        <section className={styles.categoryCard} aria-labelledby="mypage-category-title">
          <h2 id="mypage-category-title" className={styles.sectionTitle}>
            선호 레시피 카테고리
          </h2>
          <p className={styles.categoryDescription}>
            즐겨찾기와 최근 본 레시피를 기준으로 계산한 비율
          </p>
          {categoryRatios.length > 0 ? (
            <ul className={styles.categoryList}>
              {categoryRatios.map((item, index) => (
                <li key={item.category} className={styles.categoryRow}>
                  <div className={styles.categoryLabel}>
                    <span className={styles.categoryName}>{item.category}</span>
                    <span className={styles.categoryPercent}>{item.percent}%</span>
                  </div>
                  <div
                    className={styles.barTrack}
                    role="progressbar"
                    aria-label={`${item.category} 비율`}
                    aria-valuenow={item.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={styles.barFill}
                      style={{ width: `${item.percent}%`, backgroundColor: BAR_COLORS[index] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.categoryEmpty}>
              레시피를 찜하거나 둘러보면 선호 카테고리를 보여드려요.
            </p>
          )}
        </section>

        <nav className={styles.shortcuts} aria-labelledby="mypage-shortcut-title">
          <h2 id="mypage-shortcut-title" className={styles.sectionTitle}>
            바로가기
          </h2>
          <ul className={styles.shortcutList}>
            {SHORTCUTS.map((shortcut) => (
              <li key={shortcut.to}>
                <Link className={styles.shortcutCard} to={shortcut.to}>
                  <span className={styles.shortcutText}>
                    <span className={styles.shortcutTitle}>{shortcut.title}</span>
                    <span className={styles.shortcutDescription}>{shortcut.description}</span>
                  </span>
                  <span className={styles.shortcutArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.weeklyBanner}>
        <p className={styles.weeklyTitle}>이번 주 ReciPick</p>
        <p className={styles.weeklyText}>
          {addedThisWeek > 0
            ? `이번 주 냉장고에 재료 ${addedThisWeek}개를 추가했어요.`
            : '이번 주에는 아직 추가한 재료가 없어요. 냉장고를 채워 보세요.'}
        </p>
      </div>
    </section>
  );
}

export default MyPageSummary;
