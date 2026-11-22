import FridgeCard from '../components/fridge/FridgeCard.jsx';
import FridgeHeader from '../components/fridge/FridgeHeader.jsx';
import FridgeAlert from '../components/fridge/FridgeAlert.jsx';
import FridgeFilter from '../components/fridge/FridgeFilter.jsx';
import FridgeRecommend from '../components/fridge/FridgeRecommend.jsx';
import { ingredients } from '../data/ingredients.js';
import styles from '../components/fridge/FridgePage.module.css';
import { useUserData } from '../contexts/UserDataContext.jsx';
import FridgeAdd from '../components/fridge/FridgeAdd.jsx';
import { getExpiryInfo } from '../utils/getExpiryInfo.js';
import { useExpiryNotification } from '../hooks/useExpiryNotification.js';
import { useState } from 'react';

// 브라우저 알림 권한 처음 값 ('granted' | 'denied' | 'default', 지원 안 하면 'unsupported')
const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

function FridgePage() {
  const { fridgeIngredients } = useUserData();

  const [modalMode, setModalMode] = useState(null);
  // null | "add" | "edit"
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // 검색, 카테고리 탭, 정렬
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('전체');
  const [sortType, setSortType] = useState('최근 추가순');

  // 알림 권한 (배너에서 허용 누르면 바뀜 → 바로 알림 확인)
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);

  // 1. 냉장고 항목에 재료 정보(이름, 카테고리, 이미지) 붙이기
  /* 형식 :
    [
        {
            ingredientId: 1,
            quantity: 1,
            unit: '개',
            expiresAt: '2026-11-20',
            addedAt: '2026-10-29T11:29:29.981Z',
            ingredient: { id: 1, name: '밥', category: '곡류', image: '...' },
        },
    ]
  */
  const fridgeList = [];
  for (const item of fridgeIngredients) {
    const ingredient = ingredients.find((ingredient) => {
      return ingredient.id === item.ingredientId;
    });

    if (ingredient) {
      fridgeList.push({ ...item, ingredient: ingredient });
    }
  }

  // 2. 상단 개수 (신선 / 임박) 세기
  let freshCount = 0;
  let soonCount = 0;
  for (const item of fridgeList) {
    const status = getExpiryInfo(item.expiresAt).status;

    if (status === 'fresh') {
      freshCount++;
    } else if (status === 'soon' || status === 'today') {
      soonCount++;
    }
  }

  // 소비기한 임박·당일·만료 재료 크롬 알림 (같은 알림은 한 번만)
  useExpiryNotification(fridgeList, notificationPermission);

  // 3. 카테고리 탭 옆에 보여줄 개수 세기 { 채소: 6, 육류: 1, ... }
  const categoryCounts = {};
  for (const item of fridgeList) {
    const itemCategory = item.ingredient.category;

    if (categoryCounts[itemCategory]) {
      categoryCounts[itemCategory]++;
    } else {
      categoryCounts[itemCategory] = 1;
    }
  }

  // 4. 검색어 + 카테고리로 거르기
  const filteredList = [];
  for (const item of fridgeList) {
    // 검색어가 이름에 없으면 빼기
    if (!item.ingredient.name.includes(searchText.trim())) {
      continue;
    }

    // 전체가 아니면 카테고리 같은 것만
    if (category !== '전체' && item.ingredient.category !== category) {
      continue;
    }

    filteredList.push(item);
  }

  // 5. 정렬
  filteredList.sort((a, b) => {
    if (sortType === '최근 추가순') {
      // addedAt 이 ISO 문자열이라 문자열 비교로 최신이 앞으로
      if (a.addedAt > b.addedAt) return -1;
      if (a.addedAt < b.addedAt) return 1;
      return 0;
    }

    if (sortType === '소비기한 임박순') {
      // 소비기한 없는 재료는 맨 뒤로
      if (!a.expiresAt && !b.expiresAt) return 0;
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;

      if (a.expiresAt < b.expiresAt) return -1;
      if (a.expiresAt > b.expiresAt) return 1;
      return 0;
    }

    // 이름순
    return a.ingredient.name.localeCompare(b.ingredient.name);
  });

  return (
    <>
      <FridgeHeader
        totalCount={fridgeList.length}
        freshCount={freshCount}
        soonCount={soonCount}
        onAdd={() => {
          setSelectedIngredient(null);
          setModalMode('add');
        }}
      />
      <FridgeAlert onPermissionChange={setNotificationPermission} />

      <FridgeFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        category={category}
        onCategoryChange={setCategory}
        sortType={sortType}
        onSortChange={setSortType}
        categoryCounts={categoryCounts}
        totalCount={fridgeList.length}
      />

      {/* 냉장고가 비었을 때 / 검색 결과가 없을 때 */}
      {fridgeList.length === 0 ? (
        <div className={styles.empty}>
          <strong>냉장고가 비어 있어요.</strong>
          <span>식재료 추가 버튼을 눌러 보관 중인 재료를 등록해 보세요.</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className={styles.empty}>
          <strong>조건에 맞는 재료가 없어요.</strong>
          <span>검색어나 카테고리를 바꿔 보세요.</span>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredList.map((item) => (
            <FridgeCard
              key={item.ingredientId}
              ingredient={item.ingredient}
              onClick={() => {
                setSelectedIngredient(item.ingredient);
                setModalMode('edit');
              }}
            />
          ))}
        </div>
      )}

      <FridgeRecommend />

      {modalMode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FridgeAdd
              mode={modalMode}
              ingredient={selectedIngredient}
              onClose={() => {
                setModalMode(null);
                setSelectedIngredient(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default FridgePage;
