// src/contexts/UserDataContext.jsx
import { createContext, useCallback, useContext, useMemo } from 'react';

import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { INGREDIENT_UNITS } from '../data/constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const MAX_RECENT_RECIPES = 10;

const UserDataContext = createContext(null);

const nowIso = () => new Date().toISOString();
// 예전 형식(숫자 배열)으로 저장된 값은 무시한다.
const isItemObject = (item) => item !== null && typeof item === 'object';
const pickDefined = (fields) =>
  Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));

function validateFridgeFields({ quantity, unit, expiresAt }) {
  if (quantity !== undefined && quantity !== null) {
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
      throw new Error('수량은 숫자로 입력해 주세요.');
    }
    if (quantity < 0) {
      throw new Error('수량은 0 이상이어야 합니다.');
    }
  }

  if (unit !== undefined && unit !== null && !INGREDIENT_UNITS.includes(unit)) {
    throw new Error('사용할 수 없는 단위입니다.');
  }

  if (expiresAt !== undefined && expiresAt !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
      throw new Error('소비기한은 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
  }
}

export function UserDataProvider({ children }) {
  const [storedFridge, setStoredFridge] = useLocalStorage(STORAGE_KEYS.fridgeIngredients, []);
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);
  const [storedShopping, setStoredShopping] = useLocalStorage(STORAGE_KEYS.shoppingList, []);
  const [recentRecipes, setRecentRecipes] = useLocalStorage(STORAGE_KEYS.recentRecipes, []);

  const fridgeIngredients = useMemo(() => storedFridge.filter(isItemObject), [storedFridge]);
  const shoppingList = useMemo(() => storedShopping.filter(isItemObject), [storedShopping]);

  // ---------- 냉장고 ----------
  const isInFridge = useCallback(
    (ingredientId) => fridgeIngredients.some((item) => item.ingredientId === ingredientId),
    [fridgeIngredients],
  );

  const addFridgeIngredient = useCallback(
    async ({ ingredientId, quantity = null, unit = null, expiresAt = null }) => {
      validateFridgeFields({ quantity, unit, expiresAt });
      if (isInFridge(ingredientId)) {
        throw new Error('이미 냉장고에 있는 재료입니다.');
      }
      const newItem = { ingredientId, quantity, unit, expiresAt, addedAt: nowIso() };
      setStoredFridge((items) => {
        const validItems = items.filter(isItemObject);
        if (validItems.some((item) => item.ingredientId === ingredientId)) return items;
        return [newItem, ...validItems];
      });
    },
    [isInFridge, setStoredFridge],
  );

  const updateFridgeIngredient = useCallback(
    async (ingredientId, { quantity, unit, expiresAt } = {}) => {
      validateFridgeFields({ quantity, unit, expiresAt });
      if (!isInFridge(ingredientId)) {
        throw new Error('냉장고에 없는 재료입니다.');
      }
      const changes = pickDefined({ quantity, unit, expiresAt });
      setStoredFridge((items) =>
        items
          .filter(isItemObject)
          .map((item) => (item.ingredientId === ingredientId ? { ...item, ...changes } : item)),
      );
    },
    [isInFridge, setStoredFridge],
  );

  const removeFridgeIngredient = useCallback(
    async (ingredientId) => {
      setStoredFridge((items) =>
        items.filter(isItemObject).filter((item) => item.ingredientId !== ingredientId),
      );
    },
    [setStoredFridge],
  );

  // ---------- 찜 ----------
  const isFavorite = useCallback((recipeId) => favorites.includes(recipeId), [favorites]);

  const toggleFavorite = useCallback(
    async (recipeId) => {
      setFavorites((ids) =>
        ids.includes(recipeId) ? ids.filter((id) => id !== recipeId) : [recipeId, ...ids],
      );
    },
    [setFavorites],
  );

  // ---------- 장보기 ----------
  const isInShoppingList = useCallback(
    (ingredientId) => shoppingList.some((item) => item.ingredientId === ingredientId),
    [shoppingList],
  );

  const addShoppingItems = useCallback(
    async (ingredientIds) => {
      setStoredShopping((items) => {
        const validItems = items.filter(isItemObject);
        const existingIds = new Set(validItems.map((item) => item.ingredientId));
        const addedAt = nowIso();
        const newItems = [...new Set(ingredientIds)]
          .filter((id) => !existingIds.has(id))
          .map((id) => ({ ingredientId: id, checked: false, addedAt }));
        return [...newItems, ...validItems];
      });
    },
    [setStoredShopping],
  );

  const addShoppingItem = useCallback(
    async (ingredientId) => addShoppingItems([ingredientId]),
    [addShoppingItems],
  );

  const toggleShoppingItem = useCallback(
    async (ingredientId) => {
      setStoredShopping((items) =>
        items
          .filter(isItemObject)
          .map((item) =>
            item.ingredientId === ingredientId ? { ...item, checked: !item.checked } : item,
          ),
      );
    },
    [setStoredShopping],
  );

  const removeShoppingItem = useCallback(
    async (ingredientId) => {
      setStoredShopping((items) =>
        items.filter(isItemObject).filter((item) => item.ingredientId !== ingredientId),
      );
    },
    [setStoredShopping],
  );

  // ---------- 최근 본 레시피 ----------
  const addRecentlyViewed = useCallback(
    async (recipeId) => {
      setRecentRecipes((ids) =>
        [recipeId, ...ids.filter((id) => id !== recipeId)].slice(0, MAX_RECENT_RECIPES),
      );
    },
    [setRecentRecipes],
  );

  const value = useMemo(
    () => ({
      fridgeIngredients,
      addFridgeIngredient,
      updateFridgeIngredient,
      removeFridgeIngredient,
      isInFridge,
      favorites,
      toggleFavorite,
      isFavorite,
      shoppingList,
      addShoppingItem,
      addShoppingItems,
      toggleShoppingItem,
      removeShoppingItem,
      isInShoppingList,
      recentRecipes,
      addRecentlyViewed,
      isLoading: false, // 1단계(localStorage)는 즉시 읽으므로 항상 false
    }),
    [
      fridgeIngredients,
      addFridgeIngredient,
      updateFridgeIngredient,
      removeFridgeIngredient,
      isInFridge,
      favorites,
      toggleFavorite,
      isFavorite,
      shoppingList,
      addShoppingItem,
      addShoppingItems,
      toggleShoppingItem,
      removeShoppingItem,
      isInShoppingList,
      recentRecipes,
      addRecentlyViewed,
    ],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData는 UserDataProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
}
