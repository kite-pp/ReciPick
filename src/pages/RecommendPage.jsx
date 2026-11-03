import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { COOKING_TIME_FILTERS, DIFFICULTIES, RECIPE_CATEGORIES } from '../data/constants.js';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import styles from './RecommendPage.module.css';

const ALL = '전체';
const PREVIEW_INGREDIENT_COUNT = 5;

const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

const FILTER_GROUPS = [
  { key: 'category', title: '어떤 음식이 당기나요?', options: [ALL, ...RECIPE_CATEGORIES] },
  {
    key: 'time',
    title: '요리 시간 여유는요?',
    options: [ALL, ...COOKING_TIME_FILTERS.map((filter) => filter.label)],
  },
  { key: 'difficulty', title: '원하는 요리 난이도는?', options: [ALL, ...DIFFICULTIES] },
];

function RecommendPage() {
  const navigate = useNavigate();
  const { fridgeIngredients } = useUserData();
  const [selected, setSelected] = useState({ category: ALL, time: ALL, difficulty: ALL });
  const [hasResult, setHasResult] = useState(false);

  const fridgeNames = fridgeIngredients
    .slice(0, PREVIEW_INGREDIENT_COUNT)
    .map((item) => ingredientMap.get(item.ingredientId)?.name)
    .filter(Boolean)
    .join(', ');

  // 골격 - 계산 없이 앞 3개 표시
  const [mainRecipe, ...subRecipes] = recipes.slice(0, 3);

  const handleSelect = (key, option) => {
    setSelected((prev) => ({ ...prev, [key]: option }));
  };

  const handleRecommend = () => {
    setHasResult(true);
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
        <div className={styles.submitRow}>
          <Button size="large" onClick={handleRecommend}>
            내 냉장고로 메뉴 추천받기
          </Button>
        </div>
      </section>

      {/* 추천 결과 - 골격 */}
      {hasResult && mainRecipe && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>오늘의 추천 메뉴</h2>
            <p className={styles.sectionSub}>보유 재료 일치율이 가장 높은 메뉴예요.</p>
            <article className={styles.mainCard}>
              <img className={styles.mainImage} src={mainRecipe.image} alt={mainRecipe.title} />
              <div className={styles.mainInfo}>
                <Badge>{mainRecipe.category}</Badge>
                <h3 className={styles.mainTitle}>{mainRecipe.title}</h3>
                <p className={styles.mainDescription}>{mainRecipe.description}</p>
                <dl className={styles.stats}>
                  <div>
                    <dt>조리 시간</dt>
                    <dd>{mainRecipe.cookingTime}분</dd>
                  </div>
                  <div>
                    <dt>난이도</dt>
                    <dd>{mainRecipe.difficulty}</dd>
                  </div>
                  <div>
                    <dt>기준 분량</dt>
                    <dd>{mainRecipe.servings}인분</dd>
                  </div>
                </dl>
                <p className={styles.placeholder}>
                  보유·부족 재료와 일치율은 추천 기능 연결 후 표시됩니다.
                </p>
                <Link to={`/recipes/${mainRecipe.id}`} className={styles.detailLink}>
                  레시피 보기
                </Link>
              </div>
            </article>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>함께 고민할 만한 대체 추천 메뉴 (TOP 2, 3)</h2>
            <div className={styles.subGrid}>
              {subRecipes.map((recipe, index) => (
                <Link key={recipe.id} to={`/recipes/${recipe.id}`} className={styles.subCard}>
                  <img className={styles.subImage} src={recipe.image} alt={recipe.title} />
                  <div className={styles.subInfo}>
                    <span className={styles.rank}>TOP {index + 2}</span>
                    <Badge>{recipe.category}</Badge>
                    <h3 className={styles.subTitle}>{recipe.title}</h3>
                    <p className={styles.subDescription}>{recipe.description}</p>
                    <span className={styles.subMeta}>
                      {recipe.cookingTime}분 · {recipe.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default RecommendPage;
