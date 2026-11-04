import { Link } from 'react-router-dom';

import profileAvatar from '../../assets/common/profile-avatar.png';
import { ROUTES } from '../../constants/routes.js';
import styles from './MyPageSummary.module.css';

// 마이페이지 상단 요약 영역
// 사용 예시
// <MyPageSummary userName="준호" fridgeCount={12} favoriteCount={8} recentCount={6} shoppingCount={5} />
function MyPageSummary({ userName, fridgeCount, favoriteCount, recentCount, shoppingCount }) {
  // 요약 카드 4개
  const stats = [
    { label: '냉장고 재료', value: fridgeCount, caption: '보유 중인 재료' },
    { label: '즐겨찾기', value: favoriteCount, caption: '찜한 레시피' },
    { label: '최근 본 레시피', value: recentCount, caption: '최대 10개까지 저장' },
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
    </section>
  );
}

export default MyPageSummary;
