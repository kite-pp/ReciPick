# React 프로젝트 컨벤션

> 프로젝트: 보유 식재료 기반 레시피 추천 서비스  
> 기술 스택: React + Vite + JavaScript + React Router + Context API + JSON Mock Data + localStorage

---

## 1. 기본 원칙

- `main` 브랜치는 항상 실행 가능한 상태를 유지한다.
- 기능 단위로 브랜치를 생성해 작업한다.
- 한 커밋에는 가능한 한 하나의 목적만 담는다.
- 공통 컴포넌트와 데이터 구조를 임의로 변경하지 않는다.
- 공통 구조를 변경해야 할 경우 팀원과 먼저 공유한다.
- 컴포넌트는 가능한 한 한 가지 역할만 담당하도록 작성한다.
- 페이지에 모든 로직을 몰아넣지 않고 재사용 가능한 로직은 분리한다.
- Mock Data의 필드명과 타입은 팀 전체가 동일하게 사용한다.

---

## 2. Git 브랜치 전략

### 기본 브랜치

```text
main
└── develop
    ├── feature/recipe-search
    ├── feature/fridge
    ├── feature/recommendation
    └── feature/detail-favorite
```

- `main`: 배포 가능한 안정 버전
- `develop`: 다음 배포를 위한 통합 브랜치
- 작업 브랜치: 최신 `develop`에서 생성하고 `develop` 대상으로 Pull Request를 작성한다.

### 브랜치 이름 규칙

| Prefix      | 용도                     | 예시                   |
| ----------- | ------------------------ | ---------------------- |
| `feature/`  | 새로운 기능 구현         | `feature/fridge`       |
| `fix/`      | 버그 수정                | `fix/favorite-storage` |
| `refactor/` | 기능 변경 없는 코드 개선 | `refactor/recipe-card` |
| `style/`    | CSS/UI 수정              | `style/home-layout`    |
| `chore/`    | 설정, 패키지, 환경 작업  | `chore/router-setup`   |

### 작업 시작 전

```bash
git switch develop
git pull origin develop
git switch 작업브랜치
git merge develop
```

새 브랜치를 생성하는 경우:

```bash
git switch develop
git pull origin develop
git switch -c feature/기능명
```

---

## 3. Commit Message 규칙

### 형식

```text
type: 내용
```

### Type

| Type       | 의미           | 예시                                 |
| ---------- | -------------- | ------------------------------------ |
| `feat`     | 기능 추가      | `feat: 냉장고 재료 추가 기능 구현`   |
| `fix`      | 오류 수정      | `fix: 찜 목록 중복 저장 오류 수정`   |
| `style`    | UI/CSS 수정    | `style: 레시피 카드 간격 수정`       |
| `refactor` | 코드 구조 개선 | `refactor: 추천 계산 로직 함수 분리` |
| `chore`    | 프로젝트 설정  | `chore: react-router-dom 설치`       |
| `docs`     | 문서 수정      | `docs: README 역할분담 추가`         |
| `data`     | Mock Data 수정 | `data: 레시피 목데이터 추가`         |

### 좋은 예시

```text
feat: 레시피 카테고리 필터 구현
feat: 식재료 추가 모달 구현
fix: 새로고침 시 찜 목록 초기화 오류 수정
style: 레시피 상세 페이지 레이아웃 수정
refactor: 재료 일치율 계산 함수 분리
data: 한식 레시피 목데이터 10개 추가
```

### 피해야 할 예시

```text
수정
작업함
aaa
최종
최종진짜
수정2
```

---

## 4. Pull Request 규칙

기능 작업 완료 후 GitHub에 Push한 뒤 Pull Request를 생성한다.

```bash
git add .
git commit -m "feat: 냉장고 식재료 추가 기능 구현"
git push origin feature/fridge
```

### PR 제목

```text
[FEAT] 냉장고 식재료 관리 기능 구현
```

### PR 본문 예시

```md
## 작업 내용

- 식재료 추가 기능 구현
- 식재료 삭제 기능 구현
- 수량 증가/감소 기능 구현
- localStorage 저장 적용

## 확인 사항

- 새로고침 후에도 식재료 유지
- 최소 수량 1 미만으로 내려가지 않도록 처리

## 관련 화면

- /fridge
```

### Merge 규칙

- 가능하면 본인이 바로 Merge하지 않고 팀원 1명 이상 확인 후 Merge한다.
- 충돌이 발생하면 작성자가 직접 해결한다.
- Merge 후 사용이 끝난 feature 브랜치는 삭제한다.

---

## 5. 폴더 구조

```text
src/
├── assets/
│   └── images/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   └── recipe/
│       ├── RecipeCard.jsx
│       └── RecipeFilter.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── RecipeListPage.jsx
│   ├── RecipeDetailPage.jsx
│   ├── FridgePage.jsx
│   ├── RecommendPage.jsx
│   └── FavoritesPage.jsx
├── data/
│   ├── recipes.json
│   └── ingredients.json
├── contexts/
│   ├── FridgeContext.jsx
│   └── FavoriteContext.jsx
├── hooks/
├── utils/
│   └── recommendation.js
├── App.jsx
├── main.jsx
└── index.css
```

### 폴더 역할

| 폴더         | 역할                          |
| ------------ | ----------------------------- |
| `components` | 재사용 가능한 UI 컴포넌트     |
| `pages`      | Router에 직접 연결되는 페이지 |
| `data`       | JSON Mock Data                |
| `contexts`   | 전역 상태 관리                |
| `hooks`      | 재사용할 Custom Hook          |
| `utils`      | 계산/정렬/추천 등 순수 함수   |
| `assets`     | 이미지 및 정적 파일           |

---

## 6. 파일 및 폴더 이름 규칙

### React Component

PascalCase를 사용한다.

```text
RecipeCard.jsx
RecipeDetailPage.jsx
FridgeContext.jsx
```

### 일반 JavaScript 파일

camelCase를 사용한다.

```text
recommendation.js
recipeUtils.js
storageUtils.js
```

### JSON

```text
recipes.json
ingredients.json
```

### CSS

```text
RecipeCard.css
HomePage.css
```

---

## 7. Component 작성 규칙

### 함수형 컴포넌트 사용

```jsx
function RecipeCard({ recipe }) {
  return (
    <article>
      <h3>{recipe.name}</h3>
    </article>
  );
}

export default RecipeCard;
```

### Props는 구조분해할당 사용

권장:

```jsx
function RecipeCard({ recipe, onFavorite }) {
```

### 이벤트 함수명

`handle + 행동` 형태를 사용한다.

```jsx
const handleSearchChange = () => {};
const handleFavoriteClick = () => {};
const handleIngredientDelete = () => {};
```

Props로 이벤트 함수를 전달할 때는 `on + 행동`을 사용한다.

```jsx
<RecipeCard onFavorite={handleFavoriteClick} />
```

---

## 8. 변수 / 함수 이름 규칙

- 변수와 함수는 `camelCase`
- 컴포넌트는 `PascalCase`
- Boolean은 `is`, `has`, `can`, `should` 사용
- 배열은 가능하면 복수형 사용

```js
const searchKeyword = '';
const selectedCategory = '전체';
const favoriteRecipes = [];
const fridgeIngredients = [];
const isFavorite = true;
const isModalOpen = false;
```

피해야 할 이름:

```js
const a = [];
const temp = [];
const data2 = [];
```

---

## 9. State 규칙

State 이름과 setter를 일치시킨다.

```jsx
const [searchKeyword, setSearchKeyword] = useState('');
const [selectedCategory, setSelectedCategory] = useState('전체');
const [isModalOpen, setIsModalOpen] = useState(false);
```

기존 상태로 계산 가능한 값은 불필요하게 별도 State로 만들지 않는다.

```jsx
const filteredRecipes = recipes.filter(...);
```

---

## 10. React Router 규칙

```text
/                  홈
/recipes           레시피 탐색
/recipes/:id       레시피 상세
/fridge            내 냉장고
/recommend         맞춤 추천
/favorites         찜한 레시피
```

페이지 이동은 `<a>` 대신 `Link` 또는 `useNavigate()`를 사용한다.

```jsx
<Link to="/recipes">레시피 탐색</Link>
```

---

## 11. Mock Data 규칙

### recipes.json 기본 구조

```json
{
  "id": 1,
  "name": "김치볶음밥",
  "category": "한식",
  "difficulty": "쉬움",
  "cookingTime": 15,
  "servings": 1,
  "rating": 4.9,
  "reviewCount": 1420,
  "image": "/images/kimchi-rice.jpg",
  "ingredients": [
    {
      "name": "김치",
      "amount": "100g"
    },
    {
      "name": "밥",
      "amount": "1공기"
    }
  ],
  "steps": ["김치를 먹기 좋은 크기로 자른다.", "팬에 김치를 볶는다.", "밥을 넣고 함께 볶는다."]
}
```

### 규칙

- `id`는 중복되지 않는 숫자를 사용한다.
- 같은 의미의 필드는 동일한 이름을 사용한다.
- `cookingTime`은 숫자(분 단위)로 통일한다.
- `rating`은 숫자로 저장한다.
- `ingredients`는 객체 배열로 통일한다.
- 새로운 필드를 추가하거나 구조를 변경할 때 팀원에게 공유한다.

---

## 12. localStorage Key 규칙

Key 충돌을 방지하기 위해 prefix를 통일한다.

```text
fridgeChef.ingredients
fridgeChef.favorites
fridgeChef.recentRecipes
```

예:

```js
localStorage.setItem('fridgeChef.favorites', JSON.stringify(favorites));
```

가능하면 Key 문자열은 상수로 관리한다.

---

## 13. Context API 규칙

여러 페이지에서 공통으로 필요한 상태만 Context로 관리한다.

### Context 사용 대상

- 냉장고 보유 식재료
- 찜한 레시피

### Context로 만들 필요 없는 데이터

- 특정 페이지의 검색어
- 특정 페이지에서만 사용하는 Modal 상태
- 페이지 내부의 선택된 필터

---

## 14. 추천 로직 규칙

추천/계산 로직은 컴포넌트 내부에 길게 작성하지 않고 `utils`로 분리한다.

```js
export function calculateMatchRate(recipe, fridgeIngredients) {
  // 일치율 계산
}

export function getMissingIngredients(recipe, fridgeIngredients) {
  // 부족 재료 반환
}
```

예:

```text
내 냉장고: 김치 / 밥 / 계란 / 대파
필요 재료: 김치 / 밥 / 계란 / 대파 / 참기름

일치율 = 4 / 5 × 100 = 80%
```

---

## 15. CSS / UI 규칙

- Stitch/Figma 디자인 시스템을 기준으로 구현한다.
- 페이지마다 임의의 색상을 새로 추가하지 않는다.
- 공통 Button, Card, Input 스타일은 재사용한다.
- 동일한 역할의 요소는 동일한 `border-radius`, `padding`, `font-size`를 사용한다.
- 가능한 한 inline style은 사용하지 않는다.
- 반복되는 UI는 컴포넌트로 분리한다.

클래스명 예시:

```css
.recipe-card {
}
.recipe-card__image {
}
.recipe-card__title {
}
.recipe-card__meta {
}
.recipe-card__favorite-button {
}
```

---

## 16. Import 규칙

다음 순서로 정리한다.

```jsx
// 1. React / 외부 라이브러리
import { useState } from 'react';
import { Link } from 'react-router-dom';

// 2. 내부 Component
import RecipeCard from '../components/recipe/RecipeCard';

// 3. Data / Utils
import recipes from '../data/recipes.json';
import { calculateMatchRate } from '../utils/recommendation';

// 4. CSS
import './RecipeListPage.css';
```

사용하지 않는 import는 제거한다.

---

## 17. 코드 포맷

- 들여쓰기: 2 spaces
- 문자열 따옴표 스타일은 프로젝트 전체에서 통일
- 세미콜론 사용 여부도 프로젝트 전체에서 통일
- 불필요한 `console.log()`는 Merge 전에 제거
- 가능하면 ESLint + Prettier를 팀 전체가 동일하게 사용

---

## 18. 주석 규칙

코드 자체로 이해 가능한 부분에는 불필요한 주석을 작성하지 않는다.

좋은 예:

```js
// 보유 재료와 필요 재료를 비교해 레시피 일치율 계산
const matchRate = calculateMatchRate(recipe, fridgeIngredients);
```

피해야 할 예:

```js
// 변수 선언
const recipes = [];
```

---

## 19. 담당 영역

| 담당 | 주요 영역                                   |
| ---- | ------------------------------------------- |
| 1    | 홈 / 레시피 탐색 / 검색 / 필터 / 정렬       |
| 2    | 내 냉장고 / 식재료 추가·삭제 / localStorage |
| 3    | 맞춤 추천 / 일치율 / 부족 재료 / 랜덤 추천  |
| 4    | 레시피 상세 / Router / 찜 / 찜 목록         |

담당 영역 밖의 공통 코드를 수정할 경우 관련 담당자에게 공유한다.

---

## 20. 작업 완료 기준

- 기능이 정상 동작한다.
- 필요한 데이터는 새로고침 후에도 유지된다.
- 다른 페이지의 기능을 깨뜨리지 않는다.
- Mock Data 필드 구조를 준수한다.
- 불필요한 console/error가 없다.
- 페이지 이동이 정상 동작한다.
- 빈 데이터 / 검색 결과 없음 상태를 처리한다.
- Push 전에 `pnpm dev`로 직접 확인한다.

---

## 21. 개발 시작 전 체크리스트

- [ ] GitHub Repository Clone
- [ ] `pnpm install`
- [ ] `pnpm dev` 실행 확인
- [ ] 본인 feature branch 생성
- [ ] React Router 경로 확인
- [ ] Mock Data 구조 확인
- [ ] 공통 Component 확인
- [ ] Stitch/Figma 담당 화면 확인

---

## 22. 작업 종료 전 체크리스트

- [ ] 변경된 파일 확인
- [ ] 불필요한 코드 및 `console.log()` 삭제
- [ ] 화면 직접 테스트
- [ ] 다른 Route 정상 동작 확인
- [ ] `git add .`
- [ ] Convention에 맞는 Commit 작성
- [ ] Push
- [ ] Pull Request 생성
- [ ] PR 내용 작성
