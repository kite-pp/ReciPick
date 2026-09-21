import { Routes, Route } from 'react-router-dom';

import Layout from './components/common/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import RecipeListPage from './pages/RecipeListPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import FridgePage from './pages/FridgePage.jsx';
import RecommendPage from './pages/RecommendPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes" element={<RecipeListPage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="fridge" element={<FridgePage />} />
        <Route path="recommend" element={<RecommendPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
