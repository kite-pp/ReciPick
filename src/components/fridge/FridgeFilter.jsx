import styles from './FridgeFilter.module.css';
import { INGREDIENT_CATEGORIES } from '../../data/constants.js';

// 정렬 옵션 (FridgePage 에서 같은 문자열로 정렬함)
const SORT_OPTIONS = ['최근 추가순', '소비기한 임박순', '이름순'];

function FridgeFilter({
  searchText,
  onSearchChange,
  category,
  onCategoryChange,
  sortType,
  onSortChange,
  categoryCounts,
  totalCount,
}) {
  // 전체 탭 + 카테고리 탭
  const tabs = ['전체', ...INGREDIENT_CATEGORIES];

  return (
    <div className={styles.filter}>
      <input
        className={styles.search}
        type="search"
        placeholder="식재료 이름 검색 (예: 계란, 양파, 버섯...)"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className={styles.tabs}>
        {tabs.map((tab) => {
          // 탭 옆에 개수 보여주기
          let count;
          if (tab === '전체') {
            count = totalCount;
          } else {
            count = categoryCounts[tab] ?? 0;
          }

          return (
            <button
              key={tab}
              type="button"
              className={tab === category ? `${styles.tab} ${styles.active}` : styles.tab}
              onClick={() => onCategoryChange(tab)}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      <select
        className={styles.sort}
        value={sortType}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="정렬"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FridgeFilter;
