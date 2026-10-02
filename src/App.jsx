import { Routes, Route } from 'react-router-dom';

import Layout from './components/common/Layout.jsx';
import { ROUTES } from './constants/routes.js';
import HomePage from './pages/HomePage.jsx';
import RecipeListPage from './pages/RecipeListPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import FridgePage from './pages/FridgePage.jsx';
import RecommendPage from './pages/RecommendPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import MyPage from './pages/MyPage.jsx';
import RecentlyViewedPage from './pages/RecentlyViewedPage.jsx';
import ShoppingListPage from './pages/ShoppingListPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.recipes} element={<RecipeListPage />} />
        <Route path={ROUTES.recipeDetail} element={<RecipeDetailPage />} />
        <Route path={ROUTES.fridge} element={<FridgePage />} />
        <Route path={ROUTES.recommend} element={<RecommendPage />} />
        <Route path={ROUTES.favorites} element={<FavoritesPage />} />
        <Route path={ROUTES.shoppingList} element={<ShoppingListPage />} />
        <Route path={ROUTES.recent} element={<RecentlyViewedPage />} />
        <Route path={ROUTES.myPage} element={<MyPage />} />
      </Route>
    </Routes>
  );
}

export default App;
