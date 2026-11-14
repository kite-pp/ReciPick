import { Link, useParams } from 'react-router-dom';

import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RecipeCard from '../components/common/RecipeCard.jsx';
import { ROUTES } from '../constants/routes.js';
import { useUserData } from '../contexts/UserDataContext.jsx';
import { ingredients } from '../data/ingredients.js';
import { recipes } from '../data/recipes.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import { getRecipeMatch, getRecommendations } from '../utils/recommendation.js';
import styles from './RecipeDetailPage.module.css';

const SIMILAR_RECIPE_COUNT = 3;
const SEASONING_CATEGORY = '양념';

const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));
const getName = (item) => ingredientMap.get(item.ingredientId)?.name;

const getTodayKst = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());

const getDDay = (expiresAt) => {
  if (!expiresAt) return '소비기한 없음';
  const diff = Math.round((new Date(expiresAt) - new Date(getTodayKst())) / 86400000);
  if (diff < 0) return '소비기한 지남';
  return diff === 0 ? 'D-DAY' : `D-${diff}`;
};

const getStatus = (rate) => {
  if (rate === 100) return { text: '지금 바로 조리 가능', color: 'green' };
  if (rate >= 70) return { text: '즉시 조리 가능 수준', color: 'green' };
  if (rate >= 40) return { text: '재료가 부족해요', color: 'yellow' };
  return { text: '장보기가 필요해요', color: 'yellow' };
};

function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = recipes.find((item) => item.id === Number(id));

  const { isFavorite, toggleFavorite, fridgeIngredients, isInShoppingList, addShoppingItems } =
    useUserData();
  const requireLogin = useRequireLogin();

  if (!recipe) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon="🍽️"
          title="레시피를 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 레시피입니다."
        />
      </div>
    );
  }

  const recipeIngredients = recipe.ingredients.map((item) => ({
    ...item,
    info: ingredientMap.get(item.ingredientId),
  }));
  const mainList = recipeIngredients.filter((item) => item.info?.category !== SEASONING_CATEGORY);
  const seasoningList = recipeIngredients.filter(
    (item) => item.info?.category === SEASONING_CATEGORY,
  );

  // 보유/부족 재료 구분
  const match = getRecipeMatch(
    recipe,
    fridgeIngredients.map((item) => item.ingredientId),
  );
  // 이미 장보기 목록에 있는 재료는 제외 (중복 추가 방지)
  const addableItems = match.missingIngredients.filter(
    (item) => !isInShoppingList(item.ingredientId),
  );

  const status = getStatus(match.matchRate);
  const expiresMap = new Map(fridgeIngredients.map((item) => [item.ingredientId, item.expiresAt]));

  const handleAddOne = async (ingredientId) => {
    if (!requireLogin()) return;
    await addShoppingItems([ingredientId]);
  };

  // 현재 레시피를 뺀 나머지를 냉장고 일치율 높은 순으로 3개
  const similarRecipes = getRecommendations({
    recipes: recipes.filter((item) => item.id !== recipe.id),
    fridgeIngredients,
    limit: SIMILAR_RECIPE_COUNT,
  });

  const handleFavoriteClick = (targetId) => {
    if (!requireLogin()) return;
    toggleFavorite(targetId);
  };

  const handleAddMissing = async () => {
    if (!requireLogin()) return;
    await addShoppingItems(addableItems.map((item) => item.ingredientId));
  };

  const getShoppingButtonLabel = () => {
    if (match.missingIngredients.length === 0) return '부족한 재료 없음';
    if (addableItems.length === 0) return '장보기 목록에 담김';
    return `부족한 재료 ${addableItems.length}개 담기`;
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="현재 위치">
        <Link to={ROUTES.home}>홈</Link>
        <span aria-hidden="true">›</span>
        <Link to={ROUTES.recipes}>레시피 탐색</Link>
        <span aria-hidden="true">›</span>
        <span>{recipe.category}</span>
        <span aria-hidden="true">›</span>
        <strong>{recipe.title}</strong>
      </nav>

      {/* 상단 정보 */}
      <section className={styles.hero}>
        <img className={styles.heroImage} src={recipe.image} alt={recipe.title} />
        <div className={styles.heroInfo}>
          <Badge>{recipe.category}</Badge>
          <h1 className={styles.title}>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>조리 시간</dt>
              <dd>{recipe.cookingTime}분</dd>
            </div>
            <div className={styles.stat}>
              <dt>난이도</dt>
              <dd>{recipe.difficulty}</dd>
            </div>
            <div className={styles.stat}>
              <dt>분량</dt>
              <dd>{recipe.servings}인분</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => handleFavoriteClick(recipe.id)}
              aria-pressed={isFavorite(recipe.id)}
            >
              {isFavorite(recipe.id) ? '♥ 찜 해제' : '♡ 찜하기'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleAddMissing}
              disabled={addableItems.length === 0}
            >
              {getShoppingButtonLabel()}
            </Button>
          </div>
        </div>
      </section>

      {/* 냉장고 일치 카드 */}
      <section className={styles.matchCard} aria-label="냉장고 재료 일치율">
        {fridgeIngredients.length === 0 ? (
          <>
            <h2 className={styles.matchTitle}>냉장고 재료를 등록하면 일치율을 알려드려요</h2>
            <p className={styles.matchDescription}>
              <Link to={ROUTES.fridge}>내 냉장고 관리하기</Link>
            </p>
          </>
        ) : (
          <>
            <div className={styles.matchHead}>
              <span className={styles.matchIcon} aria-hidden="true">
                🧊
              </span>
              <div>
                <div className={styles.matchTitleRow}>
                  <h2 className={styles.matchTitle}>
                    내 냉장고 재료와 {match.matchRate}% 일치해요!
                  </h2>
                  <Badge color={status.color}>{status.text}</Badge>
                </div>
                <p className={styles.matchDescription}>
                  {match.isCookable
                    ? '필요한 재료를 모두 가지고 있어요.'
                    : `보유 중인 재료는 ${match.ownedIngredients.length}개, 부족한 재료는 ${match.missingIngredients.length}개입니다.`}
                </p>
              </div>
            </div>

            <div className={styles.progressBox}>
              <div className={styles.progressHead}>
                <span>
                  {match.ownedIngredients.length} /{' '}
                  {match.ownedIngredients.length + match.missingIngredients.length}개 재료 준비 완료
                </span>
                <strong>{match.matchRate}% 매칭</strong>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={match.matchRate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.progressFill} style={{ width: `${match.matchRate}%` }} />
              </div>
            </div>

            <div className={styles.matchLists}>
              <div className={styles.listBox}>
                <h3 className={styles.listTitle}>
                  ✔ 보유한 재료 ({match.ownedIngredients.length}개)
                </h3>
                {match.ownedIngredients.length === 0 ? (
                  <p className={styles.emptyText}>보유한 재료가 없어요.</p>
                ) : (
                  <ul className={styles.itemList}>
                    {match.ownedIngredients.map((item) => (
                      <li key={item.ingredientId} className={styles.item}>
                        <span>
                          <strong className={styles.itemName}>{getName(item)}</strong>
                          <span className={styles.itemAmount}>{item.amount}</span>
                        </span>
                        <span className={styles.itemAmount}>
                          {getDDay(expiresMap.get(item.ingredientId))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.listBox}>
                <h3 className={styles.listTitle}>
                  ! 부족한 재료 ({match.missingIngredients.length}개)
                </h3>
                {match.missingIngredients.length === 0 ? (
                  <p className={styles.emptyText}>부족한 재료가 없어요.</p>
                ) : (
                  <ul className={styles.itemList}>
                    {match.missingIngredients.map((item) => (
                      <li key={item.ingredientId} className={styles.item}>
                        <span>
                          <strong className={styles.itemName}>{getName(item)}</strong>
                          <span className={styles.itemAmount}>필요량: {item.amount}</span>
                        </span>
                        <Button
                          size="small"
                          onClick={() => handleAddOne(item.ingredientId)}
                          disabled={isInShoppingList(item.ingredientId)}
                        >
                          {isInShoppingList(item.ingredientId) ? '담김' : '🛒 장보기에 담기'}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* 전체 재료 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>전체 식재료 목록</h2>
        <div className={styles.ingredientGroups}>
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>
              주재료 <span>{mainList.length}종</span>
            </h3>
            {mainList.length === 0 ? (
              <p className={styles.emptyText}>등록된 주재료가 없어요.</p>
            ) : (
              <ul className={styles.groupList}>
                {mainList.map((item) => (
                  <li key={item.ingredientId}>
                    <span>{item.info?.name}</span>
                    <span>{item.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>
              양념 <span>{seasoningList.length}종</span>
            </h3>
            {seasoningList.length === 0 ? (
              <p className={styles.emptyText}>양념이 필요 없는 레시피예요.</p>
            ) : (
              <ul className={styles.groupList}>
                {seasoningList.map((item) => (
                  <li key={item.ingredientId}>
                    <span>{item.info?.name}</span>
                    <span>{item.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 조리 순서 */}
      <section className={styles.section}>
        <div className={styles.stepsHeader}>
          <span className={styles.stepsBadge}>COOKING STEPS</span>
          <span className={styles.stepsTime}>총 소요시간 {recipe.cookingTime}분</span>
        </div>
        <h2 className={styles.sectionTitle}>단계별 요리 가이드</h2>
        {recipe.steps.length === 0 ? (
          <p className={styles.emptyText}>등록된 조리 순서가 없어요.</p>
        ) : (
          <ol className={styles.stepList}>
            {recipe.steps.map((step, index) => (
              <li key={step} className={styles.step}>
                <h3 className={styles.stepTitle}>{index + 1}단계</h3>
                <p className={styles.stepText}>{step}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 비슷한 레시피 */}
      {similarRecipes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>지금 냉장고 재료로 만들 수 있는 비슷한 레시피</h2>
          <div className={styles.recipeGrid}>
            {similarRecipes.map((item) => (
              <RecipeCard
                key={item.recipe.id}
                recipe={item.recipe}
                matchRate={item.matchRate}
                isFavorite={isFavorite(item.recipe.id)}
                onFavoriteClick={() => handleFavoriteClick(item.recipe.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default RecipeDetailPage;
