import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { COOKING_TIME_FILTERS, DIFFICULTIES, RECIPE_CATEGORIES } from '../data/constants.js';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { getRecommendations } from '../utils/recommendation.js';
import styles from './RecommendPage.module.css';

const ALL = '상관없어요';
const PREVIEW_INGREDIENT_COUNT = 5;

const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

const FILTER_GROUPS = [
  { key: 'category', title: '어떤 음식이 당기나요?', options: [...RECIPE_CATEGORIES, ALL] },
  {
    key: 'time',
    title: '요리 시간 여유는요?',
    options: [...COOKING_TIME_FILTERS.map((filter) => filter.label), ALL],
  },
  { key: 'difficulty', title: '원하는 요리 난이도는?', options: [...DIFFICULTIES, ALL] },
];

function RecommendPage() {
  const navigate = useNavigate();
  const { fridgeIngredients } = useUserData();
  const [selected, setSelected] = useState({ category: ALL, time: ALL, difficulty: ALL });

  const fridgeNames = fridgeIngredients
    .slice(0, PREVIEW_INGREDIENT_COUNT)
    .map((item) => ingredientMap.get(item.ingredientId)?.name)
    .filter(Boolean)
    .join(', ');

  const results = useMemo(
    () =>
      getRecommendations({
        recipes,
        fridgeIngredients,
        filters: {
          category: selected.category === ALL ? null : selected.category,
          difficulty: selected.difficulty === ALL ? null : selected.difficulty,
          maxMinutes: selected.time === ALL ? null : Number.parseInt(selected.time, 10),
        },
      }),
    [fridgeIngredients, selected],
  );
  const [main, ...subs] = results.slice(0, 3);

  const getNames = (items) =>
    items.map((item) => ingredientMap.get(item.ingredientId)?.name).filter(Boolean);

  const handleSelect = (key, option) => {
    setSelected((prev) => ({ ...prev, [key]: option }));
  };

  if (fridgeIngredients.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="🧊"
          title="냉장고가 비어 있어요"
          description="재료를 등록하면 맞춤 레시피를 추천해 드려요."
          actionLabel="냉장고 채우러 가기"
          onAction={() => navigate(ROUTES.fridge)}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 제목 */}
      <section className={styles.hero}>
        <span className={styles.pill}>냉장고 기반 맞춤 추천</span>
        <h1 className={styles.title}>오늘 뭐 먹지?</h1>
        <p className={styles.subtitle}>
          몇 가지 조건만 선택하시면, 지금 냉장고 속 식재료로 즉시 완성할 수 있는 최적의 레시피를
          정밀하게 매칭해 드릴게요.
        </p>
        <div className={styles.fridgeBar}>
          <strong>현재 내 냉장고: 식재료 {fridgeIngredients.length}개 보관 중</strong>
          {fridgeNames && <span className={styles.fridgeNames}>{fridgeNames} 등</span>}
          <Link to={ROUTES.fridge} className={styles.fridgeLink}>
            수정
          </Link>
        </div>
      </section>

      {/* 3단계 필터 */}
      <section className={styles.filterCard} aria-label="취향 필터">
        <h2 className={styles.filterTitle}>3단계 간편 취향 필터</h2>
        <div className={styles.filterGrid}>
          {FILTER_GROUPS.map((group, index) => (
            <div key={group.key} className={styles.filterBox}>
              <h3 className={styles.filterQuestion}>
                <span className={styles.step}>{index + 1}</span>
                {group.title}
              </h3>
              <div className={styles.optionList}>
                {group.options.map((option) => {
                  const isActive = selected[group.key] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={
                        isActive ? styles.option + ' ' + styles.optionActive : styles.option
                      }
                      aria-pressed={isActive}
                      onClick={() => handleSelect(group.key, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {!main ? (
        <EmptyState
          icon="🔍"
          title="조건에 맞는 추천 메뉴가 없어요"
          description="필터를 바꾸거나 냉장고 재료를 더 등록해 보세요."
        />
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>오늘의 추천 메뉴</h2>
            <article className={styles.mainCard}>
              <img className={styles.mainImage} src={main.recipe.image} alt={main.recipe.title} />
              <div className={styles.mainInfo}>
                <Badge color="green">내 재료 {main.matchRate}% 일치</Badge>
                <h3 className={styles.mainTitle}>{main.recipe.title}</h3>
                <p className={styles.mainDescription}>{main.recipe.description}</p>
                <p className={styles.placeholder}>
                  보유한 재료 {main.ownedIngredients.length}개:{' '}
                  {getNames(main.ownedIngredients).join(', ')}
                </p>
                <p className={styles.placeholder}>
                  {main.isCookable
                    ? '모든 필수 재료가 냉장고에 준비되어 있어요.'
                    : `부족한 재료 ${main.missingIngredients.length}개: ${getNames(main.missingIngredients).join(', ')}`}
                </p>
                <Link to={`/recipes/${main.recipe.id}`} className={styles.detailLink}>
                  레시피 보기
                </Link>
              </div>
            </article>
          </section>

          {subs.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>대체 추천 메뉴 (TOP 2, 3)</h2>
              <div className={styles.subGrid}>
                {subs.map((item, index) => (
                  <Link
                    key={item.recipe.id}
                    to={`/recipes/${item.recipe.id}`}
                    className={styles.subCard}
                  >
                    <img
                      className={styles.subImage}
                      src={item.recipe.image}
                      alt={item.recipe.title}
                    />
                    <div className={styles.subInfo}>
                      <span className={styles.rank}>TOP {index + 2}</span>
                      <Badge color="green">{item.matchRate}% 일치</Badge>
                      <h3 className={styles.subTitle}>{item.recipe.title}</h3>
                      {item.missingIngredients.length > 0 && (
                        <span className={styles.subMeta}>
                          부족: {getNames(item.missingIngredients).join(', ')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default RecommendPage;
