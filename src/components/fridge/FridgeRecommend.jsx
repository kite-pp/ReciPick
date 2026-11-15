import { Link } from 'react-router-dom';

import styles from './FridgeRecommend.module.css';
import { ROUTES } from '../../constants/routes.js';
import { recipes } from '../../data/recipes.js';
import { useUserData } from '../../contexts/UserDataContext.jsx';
import { getRecommendations } from '../../utils/recommendation.js';

function FridgeRecommend() {
  const { fridgeIngredients } = useUserData();

  // #41 추천 함수로 일치율 높은 레시피 3개 가져오기
  // 형식 : [{ recipe, matchRate, ownedIngredients, missingIngredients, isCookable }]
  const recommendList = getRecommendations({
    recipes,
    fridgeIngredients,
    limit: 3,
  });

  return (
    <section className={styles.recommend}>
      <div className={styles.textBox}>
        <span className={styles.badge}>🍳 스마트 셰프 추천 알고리즘 가동</span>
        <h2>냉장고 속 재료로 무엇을 만들 수 있을까요?</h2>
        <p>
          현재 등록된 {fridgeIngredients.length}가지 식재료로 지금 만들 수 있는 레시피를 일치율
          순으로 보여드려요.
        </p>

        <div className={styles.chips}>
          {recommendList.length === 0 ? (
            <span className={styles.emptyChip}>재료를 추가하면 레시피를 추천해 드려요.</span>
          ) : (
            recommendList.map((item) => (
              <Link
                key={item.recipe.id}
                className={styles.chip}
                to={`${ROUTES.recipes}/${item.recipe.id}`}
              >
                ● {item.recipe.title} <strong>{item.matchRate}% 일치</strong>
              </Link>
            ))
          )}
        </div>
      </div>

      <Link className={styles.button} to={ROUTES.recommend}>
        맞춤 레시피 보러가기 →
      </Link>
    </section>
  );
}

export default FridgeRecommend;
