import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../common/Button.jsx';
import IngredientChip from '../common/IngredientChip.jsx';
import Input from '../common/Input.jsx';
import SearchBar from '../common/SearchBar.jsx';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../contexts/useAuth.js';
import { RECIPE_CATEGORIES } from '../../data/constants.js';
import { ingredients } from '../../data/ingredients.js';
import styles from './MyPageSettings.module.css';

const MAX_SEARCH_RESULTS = 8;

const NOTIFICATION_OPTIONS = [
  {
    key: 'expiry',
    title: '소비기한 임박 알림',
    description: '소비기한 D-7·당일·만료 재료가 있으면 알려드려요.',
  },
  {
    key: 'recommendation',
    title: '맞춤 추천 알림',
    description: '저녁에 접속하면 오늘의 추천 레시피를 알려드려요.',
  },
  {
    key: 'shopping',
    title: '장보기 리마인드',
    description: '구매하지 않은 장보기 항목이 있으면 하루 한 번 알려드려요.',
  },
];

// 마이페이지 하단 설정 영역
// 닉네임만 AuthContext.updateProfile로 저장하고, 취향·제외 재료·알림은 #47에서 사용자별 저장을 연결합니다.
function MyPageSettings() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(user?.user_metadata?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [excludedIds, setExcludedIds] = useState([]);
  const [notifications, setNotifications] = useState({
    expiry: true,
    recommendation: false,
    shopping: false,
  });
  const [accountError, setAccountError] = useState('');

  if (!user) return null;

  const trimmedKeyword = keyword.trim();
  const searchResults = trimmedKeyword
    ? ingredients
        .filter(
          (ingredient) =>
            ingredient.name.includes(trimmedKeyword) && !excludedIds.includes(ingredient.id),
        )
        .slice(0, MAX_SEARCH_RESULTS)
    : [];
  const excludedIngredients = ingredients.filter((ingredient) =>
    excludedIds.includes(ingredient.id),
  );

  const handleNicknameSave = async () => {
    setNicknameMessage('');
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해 주세요.');
      return;
    }

    try {
      await updateProfile({ nickname: nickname.trim() });
      setNicknameError('');
      setNicknameMessage('닉네임을 저장했어요.');
    } catch (error) {
      setNicknameError(error.message);
    }
  };

  const toggleCategory = (category) => {
    setPreferredCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const addExcluded = (ingredientId) => {
    setExcludedIds((prev) => (prev.includes(ingredientId) ? prev : [...prev, ingredientId]));
    setKeyword('');
  };

  const removeExcluded = (ingredientId) => {
    setExcludedIds((prev) => prev.filter((id) => id !== ingredientId));
  };

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) addExcluded(searchResults[0].id);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      setAccountError(error.message);
    }
  };

  return (
    <section className={styles.settings} aria-labelledby="settings-title">
      <header className={styles.heading}>
        <h2 id="settings-title" className={styles.title}>
          설정
        </h2>
        <p className={styles.subtitle}>내 정보, 음식 취향, 알림을 관리하세요.</p>
      </header>

      <div className={styles.row}>
        <div className={styles.card}>
          <section className={styles.section} aria-labelledby="settings-profile">
            <div className={styles.sectionHead}>
              <h3 id="settings-profile" className={styles.sectionTitle}>
                내 정보
              </h3>
              <p className={styles.sectionDescription}>닉네임은 헤더와 마이페이지에 표시돼요.</p>
            </div>
            <div className={styles.nicknameRow}>
              <div className={styles.nicknameInput}>
                <Input
                  id="settings-nickname"
                  aria-label="닉네임"
                  placeholder={user.email.split('@')[0]}
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setNicknameError('');
                    setNicknameMessage('');
                  }}
                  error={nicknameError}
                  helperText={nicknameMessage}
                />
              </div>
              <Button variant="secondary" onClick={handleNicknameSave}>
                저장
              </Button>
            </div>
            <p className={styles.sectionDescription}>{user.email}</p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} aria-labelledby="settings-taste">
            <div className={styles.sectionHead}>
              <h3 id="settings-taste" className={styles.sectionTitle}>
                음식 취향
              </h3>
              <p className={styles.sectionDescription}>
                선호 카테고리는 일치율이 같은 레시피를 정렬할 때 우선 반영돼요.
              </p>
            </div>
            <div className={styles.chipList}>
              {RECIPE_CATEGORIES.map((category) => {
                const isSelected = preferredCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={styles.chipButton}
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category)}
                  >
                    <IngredientChip label={category} state={isSelected ? 'selected' : 'default'} />
                  </button>
                );
              })}
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} aria-labelledby="settings-excluded">
            <div className={styles.sectionHead}>
              <h3 id="settings-excluded" className={styles.sectionTitle}>
                알레르기·제외 재료
              </h3>
              <p className={styles.sectionDescription}>
                선택한 재료가 들어간 레시피는 추천과 목록에서 제외돼요.
              </p>
            </div>
            <div className={styles.search}>
              <SearchBar
                id="settings-excluded-search"
                label="제외할 재료 검색"
                placeholder="제외할 재료 검색 (예: 새우)"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onSubmit={handleSearchSubmit}
              />
            </div>
            {trimmedKeyword &&
              (searchResults.length > 0 ? (
                <ul className={styles.chipList} aria-label="재료 검색 결과">
                  {searchResults.map((ingredient) => (
                    <li key={ingredient.id}>
                      <button
                        type="button"
                        className={styles.chipButton}
                        onClick={() => addExcluded(ingredient.id)}
                        aria-label={ingredient.name + ' 제외 재료로 추가'}
                      >
                        <IngredientChip label={`+ ${ingredient.name}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.sectionDescription}>
                  ‘{trimmedKeyword}’ 재료를 찾지 못했어요.
                </p>
              ))}
            {excludedIngredients.length > 0 ? (
              <ul className={styles.chipList} aria-label="제외한 재료">
                {excludedIngredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    <IngredientChip
                      label={ingredient.name}
                      state="selected"
                      onRemove={() => removeExcluded(ingredient.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>아직 제외한 재료가 없어요.</p>
            )}
          </section>
        </div>

        <div className={styles.card}>
          <section className={styles.section} aria-labelledby="settings-notification">
            <div className={styles.sectionHead}>
              <h3 id="settings-notification" className={styles.sectionTitle}>
                알림
              </h3>
              <p className={styles.sectionDescription}>
                앱에 접속할 때 확인해서 알려드려요. 브라우저를 닫은 동안에는 알림이 오지 않아요.
              </p>
            </div>
            <ul className={styles.notificationList}>
              {NOTIFICATION_OPTIONS.map((option) => (
                <li key={option.key} className={styles.notificationRow}>
                  <div className={styles.notificationText}>
                    <span id={`notification-${option.key}`} className={styles.notificationTitle}>
                      {option.title}
                    </span>
                    <span className={styles.sectionDescription}>{option.description}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    className={styles.toggle}
                    aria-checked={notifications[option.key]}
                    aria-labelledby={`notification-${option.key}`}
                    onClick={() => toggleNotification(option.key)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section} aria-labelledby="settings-account">
            <h3 id="settings-account" className={styles.sectionTitle}>
              계정
            </h3>
            <div>
              <Button variant="secondary" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
            {accountError && (
              <p className={styles.error} role="alert">
                {accountError}
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

export default MyPageSettings;
