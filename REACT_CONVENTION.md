# React 프로젝트 컨벤션

> JavaScript + React 19 + Vite 8 + React Router 7 기준입니다. 앱 계층과 파일 배치는 [애플리케이션 구조](./docs/APP_STRUCTURE.md)를 함께 따릅니다.

## 1. 기본 원칙

- 컴포넌트는 한 가지 역할에 집중합니다.
- 페이지에 모든 로직을 넣지 않고 재사용 로직은 `hooks` 또는 `utils`로 분리합니다.
- 공통 상수는 문자열을 중복하지 않고 `constants`에서 관리합니다.
- 여러 화면에서 공유하는 상태만 Context API로 관리합니다.
- 서버 연동 전 데이터는 JavaScript Mock Data로 관리합니다.
- 변경 범위를 작게 유지하고 한 커밋에는 하나의 목적을 담습니다.

## 2. Git 작업 순서

모든 작업은 다음 순서를 지킵니다.

1. GitHub Issue 생성
2. 최신 `develop`에서 작업 브랜치 생성
3. 구현 및 로컬 검증
4. Convention에 맞는 커밋 생성
5. 작업 브랜치 Push
6. `develop` 대상 Pull Request 생성
7. PR 본문에 `Close #이슈번호` 작성
8. 리뷰와 CI 확인 후 병합
9. 병합된 작업 브랜치 삭제

`main`과 `develop`에는 직접 Push하지 않습니다. `main`은 배포 가능한 안정 버전, `develop`은 다음 배포를 위한 통합 브랜치입니다.

### 브랜치 이름

```text
type/이슈번호-작업명
```

| Prefix      | 용도                     | 예시                          |
| ----------- | ------------------------ | ----------------------------- |
| `feature/`  | 새로운 기능              | `feature/21-recipe-search`    |
| `fix/`      | 버그 수정                | `fix/24-favorite-storage`     |
| `refactor/` | 동작 변경 없는 구조 개선 | `refactor/27-recipe-card`     |
| `style/`    | UI/CSS 수정              | `style/30-home-layout`        |
| `chore/`    | 설정, 문서, 환경 작업    | `chore/14-docs-app-structure` |

### Commit Message

```text
type: 변경 내용
```

사용 가능한 type은 `feat`, `fix`, `style`, `refactor`, `chore`, `docs`, `data`입니다. 제목은 변경 결과가 드러나는 한글 문장으로 작성합니다.

### Pull Request

- 제목은 `[TYPE] 변경 내용` 형식을 사용합니다.
- 작업 내용, 확인 사항, 관련 이슈를 작성합니다.
- UI 변경은 확인 가능한 화면을 첨부합니다.
- 가능하면 작성자 외 팀원 한 명이 확인한 뒤 병합합니다.

## 3. 파일과 이름

| 대상            | 규칙                       | 예시                    |
| --------------- | -------------------------- | ----------------------- |
| React 컴포넌트  | PascalCase                 | `RecipeCard.jsx`        |
| 일반 JavaScript | camelCase                  | `storageUtils.js`       |
| CSS Module      | 컴포넌트명 + `.module.css` | `RecipeCard.module.css` |
| Mock Data       | camelCase `.js`            | `recipes.js`            |

- 변수와 함수는 `camelCase`를 사용합니다.
- Boolean은 `is`, `has`, `can`, `should`로 시작합니다.
- 배열은 복수형 이름을 사용합니다.
- 이벤트 처리 함수는 `handle + 행동`, Props는 `on + 행동`으로 작성합니다.

## 4. Component와 State

- 함수형 컴포넌트를 사용합니다.
- Props는 매개변수에서 구조분해할당합니다.
- 기존 값으로 계산할 수 있는 값은 별도 State로 만들지 않습니다.
- 특정 화면에서만 쓰는 검색어, 필터, Modal 상태는 지역 State로 관리합니다.
- 냉장고, 찜 목록처럼 여러 화면이 공유하는 상태만 Context API를 사용합니다.

```jsx
function RecipeCard({ recipe, onFavorite }) {
  return (
    <article>
      <h3>{recipe.name}</h3>
      <button type="button" onClick={() => onFavorite(recipe.id)}>
        찜하기
      </button>
    </article>
  );
}
```

## 5. Router

- 경로 문자열은 `src/constants/routes.js`에서 관리합니다.
- 페이지 이동은 `<a>` 대신 `Link`, `NavLink`, `useNavigate`를 사용합니다.
- 라우트 화면은 `src/pages`에 두고 `Page` 접미사를 사용합니다.

현재 라우트 목록은 [README](./README.md#라우트)를 기준으로 합니다.

## 6. Mock Data

Mock Data는 `src/data/*.js`에 배열 또는 객체로 export합니다. 필드 이름과 타입을 팀 전체에서 통일합니다.

```js
export const recipes = [
  {
    id: 1,
    name: '김치볶음밥',
    category: '한식',
    difficulty: '쉬움',
    cookingTime: 15,
    servings: 1,
    rating: 4.9,
    ingredients: [{ name: '김치', amount: '100g' }],
    steps: ['김치를 먹기 좋은 크기로 자른다.'],
  },
];
```

- `id`는 중복되지 않는 숫자를 사용합니다.
- `cookingTime`은 분 단위 숫자입니다.
- `ingredients`는 `{ name, amount }` 객체 배열입니다.
- 필드를 추가하거나 타입을 변경하면 관련 문서와 사용처를 함께 갱신합니다.

## 7. localStorage

- Key는 `src/constants/storageKeys.js`에서 관리합니다.
- `recipick.` prefix를 사용합니다.
- 읽기/쓰기 로직은 `src/hooks/useLocalStorage.js`를 재사용합니다.
- 저장 실패 시 화면 전체가 중단되지 않도록 예외를 처리합니다.

## 8. CSS와 UI

- 전역 디자인 토큰, reset, 기본 요소 스타일만 `src/styles/global.css`에 둡니다.
- 컴포넌트와 페이지 스타일은 CSS Modules를 사용합니다.
- inline style은 동적으로 계산되는 값에만 사용합니다.
- 반복되는 Button, Card, Input은 공통 컴포넌트로 분리합니다.
- 색상, 간격, 글자 크기는 기존 디자인 토큰을 우선 사용합니다.

```jsx
import styles from './RecipeCard.module.css';

function RecipeCard() {
  return <article className={styles.card}>레시피</article>;
}
```

## 9. Import 순서

빈 줄로 다음 그룹을 구분합니다.

1. React 및 외부 라이브러리
2. 내부 컴포넌트
3. constants, data, hooks, utils
4. assets
5. CSS

사용하지 않는 import와 불필요한 `console.log`는 제거합니다.

## 10. 코드 포맷

- 들여쓰기 2 spaces
- 작은따옴표와 세미콜론 사용
- ESLint와 Prettier 결과를 기준으로 통일

Push 전 다음 명령을 모두 통과해야 합니다.

```bash
pnpm format:check
pnpm lint
pnpm build
```

## 11. 작업 완료 기준

- Issue의 완료 조건을 충족합니다.
- 관련 라우트와 빈 데이터 상태를 직접 확인합니다.
- 새로고침 후 유지가 필요한 값은 정상 복원됩니다.
- 다른 화면과 공통 레이아웃이 깨지지 않습니다.
- Mock Data 및 localStorage 스키마를 준수합니다.
- 문서와 실제 코드가 함께 갱신됩니다.
- PR 본문에 검증 결과와 `Close #이슈번호`를 남깁니다.
