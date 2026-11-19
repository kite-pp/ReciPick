// src/contexts/UserDataContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { INGREDIENT_UNITS } from '../data/constants.js';
import { supabase } from '../utils/supabaseClient.js';
import { useAuth } from './useAuth.js';

const MAX_RECENT_RECIPES = 10;
// 로그아웃 상태에서 보여줄 빈 목록 (매번 새 배열을 만들지 않으려고 하나만 둠)
const EMPTY_LIST = [];

const UserDataContext = createContext(null);

const nowIso = () => new Date().toISOString();
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
  // 로그인한 계정의 데이터만 Supabase에서 불러오고 저장합니다.
  const { user } = useAuth();
  const userId = user?.id;

  // 냉장고 재료 목록과 "누구의 목록인지"를 같이 저장
  // 항목 모양: { ingredientId, quantity, unit, expiresAt, addedAt }
  const [fridgeData, setFridgeData] = useState({ userId: null, items: EMPTY_LIST });

  // 지금 로그인한 계정의 목록일 때만 보여주기 (로그아웃·다른 계정이면 빈 목록)
  let fridgeIngredients = EMPTY_LIST;
  if (userId && fridgeData.userId === userId) {
    fridgeIngredients = fridgeData.items;
  }

  // 로그인하면 냉장고 재료를 Supabase에서 불러오기
  useEffect(() => {
    if (!userId || !supabase) return;

    let ignore = false;

    supabase
      .from('fridge_items')
      .select('ingredient_id, quantity, unit, expires_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 넣은 게 앞
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error('냉장고 재료를 불러오지 못했어요.', error);
          return;
        }

        // DB 이름(ingredient_id, expires_at) → 앱 이름(ingredientId, expiresAt)으로 바꾸기
        const items = [];
        for (const row of data) {
          items.push({
            ingredientId: row.ingredient_id,
            // NUMERIC 칸은 문자열로 올 수 있어서 숫자로 바꿈
            quantity: row.quantity === null ? null : Number(row.quantity),
            unit: row.unit,
            expiresAt: row.expires_at,
            addedAt: row.created_at,
          });
        }
        setFridgeData({ userId, items });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  // 찜 목록과 "누구의 목록인지"를 같이 저장
  const [favoriteData, setFavoriteData] = useState({ userId: null, ids: EMPTY_LIST });

  // 지금 로그인한 계정의 목록일 때만 보여주기 (로그아웃·다른 계정이면 빈 목록)
  let favorites = EMPTY_LIST;
  if (userId && favoriteData.userId === userId) {
    favorites = favoriteData.ids;
  }

  // 로그인하면 내 찜 목록을 Supabase에서 불러오기
  useEffect(() => {
    // 로그아웃 상태거나 Supabase 설정이 없으면 불러오지 않음
    if (!userId || !supabase) return;

    // 계정을 빨리 바꿨을 때, 예전 계정 결과가 늦게 와서 덮어쓰지 않게 막는 표시
    let ignore = false;

    supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 찜한 게 앞
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error('찜 목록을 불러오지 못했어요.', error);
          return;
        }

        // [{ recipe_id: 1 }, { recipe_id: 3 }] → [1, 3]
        const ids = [];
        for (const row of data) {
          ids.push(row.recipe_id);
        }
        setFavoriteData({ userId, ids });
      });

    // 계정이 바뀌거나 화면을 떠나면 이전 요청 결과는 무시
    return () => {
      ignore = true;
    };
  }, [userId]);

  // 장보기 목록과 "누구의 목록인지"를 같이 저장
  // 항목 모양: { ingredientId, checked, addedAt }
  const [shoppingData, setShoppingData] = useState({ userId: null, items: EMPTY_LIST });

  // 지금 로그인한 계정의 목록일 때만 보여주기 (로그아웃·다른 계정이면 빈 목록)
  let shoppingList = EMPTY_LIST;
  if (userId && shoppingData.userId === userId) {
    shoppingList = shoppingData.items;
  }

  // 로그인하면 장보기 목록을 Supabase에서 불러오기
  useEffect(() => {
    if (!userId || !supabase) return;

    let ignore = false;

    supabase
      .from('shopping_items')
      .select('ingredient_id, checked, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 담은 게 앞
      .order('id', { ascending: true }) // 한 번에 담은 재료는 담은 순서대로
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error('장보기 목록을 불러오지 못했어요.', error);
          return;
        }

        // DB 이름(ingredient_id) → 앱 이름(ingredientId)으로 바꾸기
        const items = [];
        for (const row of data) {
          items.push({
            ingredientId: row.ingredient_id,
            checked: row.checked,
            addedAt: row.created_at,
          });
        }
        setShoppingData({ userId, items });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  // 최근 본 레시피 목록과 "누구의 목록인지"를 같이 저장
  const [recentData, setRecentData] = useState({ userId: null, ids: EMPTY_LIST });

  // 지금 로그인한 계정의 목록일 때만 보여주기 (로그아웃·다른 계정이면 빈 목록)
  let recentRecipes = EMPTY_LIST;
  if (userId && recentData.userId === userId) {
    recentRecipes = recentData.ids;
  }

  // 로그인하면 최근 본 레시피를 Supabase에서 불러오기
  useEffect(() => {
    if (!userId || !supabase) return;

    let ignore = false;

    supabase
      .from('recent_recipes')
      .select('recipe_id')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false }) // 최근에 본 게 앞
      .limit(MAX_RECENT_RECIPES)
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error('최근 본 레시피를 불러오지 못했어요.', error);
          return;
        }

        const ids = [];
        for (const row of data) {
          ids.push(row.recipe_id);
        }
        setRecentData({ userId, ids });
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

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
      if (!userId || !supabase) return;

      // 화면 맨 앞에 먼저 넣기
      const newItem = { ingredientId, quantity, unit, expiresAt, addedAt: nowIso() };
      setFridgeData((prev) => ({ userId, items: [newItem, ...prev.items] }));

      // DB에 저장
      await supabase.from('fridge_items').insert({
        user_id: userId,
        ingredient_id: ingredientId,
        quantity,
        unit,
        expires_at: expiresAt,
      });
    },
    [isInFridge, userId],
  );

  const updateFridgeIngredient = useCallback(
    async (ingredientId, { quantity, unit, expiresAt } = {}) => {
      validateFridgeFields({ quantity, unit, expiresAt });
      if (!isInFridge(ingredientId)) {
        throw new Error('냉장고에 없는 재료입니다.');
      }
      if (!userId || !supabase) return;

      // 넘어온 값만 바꾸기 (undefined인 항목은 그대로 둠)
      const changes = pickDefined({ quantity, unit, expiresAt });

      // 화면에서 먼저 바꾸기
      setFridgeData((prev) => ({
        userId,
        items: prev.items.map((item) =>
          item.ingredientId === ingredientId ? { ...item, ...changes } : item,
        ),
      }));

      // DB 이름으로 바꿔서 저장 (expiresAt → expires_at)
      const dbChanges = pickDefined({ quantity, unit, expires_at: expiresAt });
      await supabase
        .from('fridge_items')
        .update(dbChanges)
        .eq('user_id', userId)
        .eq('ingredient_id', ingredientId);
    },
    [isInFridge, userId],
  );

  const removeFridgeIngredient = useCallback(
    async (ingredientId) => {
      if (!userId || !supabase) return;

      // 화면에서 먼저 빼기
      setFridgeData((prev) => ({
        userId,
        items: prev.items.filter((item) => item.ingredientId !== ingredientId),
      }));

      // DB에서 삭제
      await supabase
        .from('fridge_items')
        .delete()
        .eq('user_id', userId)
        .eq('ingredient_id', ingredientId);
    },
    [userId],
  );

  // ---------- 찜 ----------
  const isFavorite = useCallback((recipeId) => favorites.includes(recipeId), [favorites]);

  const toggleFavorite = useCallback(
    async (recipeId) => {
      if (!userId || !supabase) return;

      if (favorites.includes(recipeId)) {
        // 이미 찜했으면 → 해제: 화면에서 먼저 빼고 DB에서 삭제
        setFavoriteData({ userId, ids: favorites.filter((id) => id !== recipeId) });
        await supabase.from('favorites').delete().eq('user_id', userId).eq('recipe_id', recipeId);
      } else {
        // 찜 안 했으면 → 추가: 화면 맨 앞에 넣고 DB에 저장
        setFavoriteData({ userId, ids: [recipeId, ...favorites] });
        await supabase.from('favorites').insert({ user_id: userId, recipe_id: recipeId });
      }
    },
    [favorites, userId],
  );

  // ---------- 장보기 ----------
  const isInShoppingList = useCallback(
    (ingredientId) => shoppingList.some((item) => item.ingredientId === ingredientId),
    [shoppingList],
  );

  const addShoppingItems = useCallback(
    async (ingredientIds) => {
      if (!userId || !supabase) return;

      // 이미 장보기에 있는 재료와, 넘어온 목록 안의 중복은 빼고 새로 담을 재료만 고르기
      const newIds = [];
      for (const id of ingredientIds) {
        const alreadyInList = shoppingList.some((item) => item.ingredientId === id);
        if (!alreadyInList && !newIds.includes(id)) {
          newIds.push(id);
        }
      }
      if (newIds.length === 0) return;

      // 화면 맨 앞에 먼저 넣기
      const addedAt = nowIso();
      const newItems = newIds.map((id) => ({ ingredientId: id, checked: false, addedAt }));
      setShoppingData((prev) => ({ userId, items: [...newItems, ...prev.items] }));

      // DB에 저장 (혹시 이미 있으면 그대로 두기)
      const rows = newIds.map((id) => ({ user_id: userId, ingredient_id: id, checked: false }));
      await supabase
        .from('shopping_items')
        .upsert(rows, { onConflict: 'user_id,ingredient_id', ignoreDuplicates: true });
    },
    [shoppingList, userId],
  );

  const addShoppingItem = useCallback(
    async (ingredientId) => addShoppingItems([ingredientId]),
    [addShoppingItems],
  );

  const toggleShoppingItem = useCallback(
    async (ingredientId) => {
      if (!userId || !supabase) return;

      const target = shoppingList.find((item) => item.ingredientId === ingredientId);
      if (!target) return;
      const nextChecked = !target.checked;

      // 화면에서 체크 상태 먼저 바꾸기
      setShoppingData((prev) => ({
        userId,
        items: prev.items.map((item) =>
          item.ingredientId === ingredientId ? { ...item, checked: nextChecked } : item,
        ),
      }));

      // DB에도 체크 상태 저장
      await supabase
        .from('shopping_items')
        .update({ checked: nextChecked })
        .eq('user_id', userId)
        .eq('ingredient_id', ingredientId);
    },
    [shoppingList, userId],
  );

  const removeShoppingItem = useCallback(
    async (ingredientId) => {
      if (!userId || !supabase) return;

      // 화면에서 먼저 빼기
      // ("구매 완료 삭제"는 여러 개를 연달아 지우기 때문에, 이전 상태(prev)를 기준으로 빼야 다 지워짐)
      setShoppingData((prev) => ({
        userId,
        items: prev.items.filter((item) => item.ingredientId !== ingredientId),
      }));

      // DB에서 삭제
      await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', userId)
        .eq('ingredient_id', ingredientId);
    },
    [userId],
  );

  // ---------- 최근 본 레시피 ----------
  const addRecentlyViewed = useCallback(
    async (recipeId) => {
      if (!userId || !supabase) return;

      // 이미 맨 앞에 있으면 할 일이 없음
      // (상세 화면이 이 함수가 바뀔 때마다 다시 부르기 때문에, 여기서 멈춰야 무한 반복이 안 됨)
      if (recentRecipes[0] === recipeId) return;

      // 맨 앞에 넣고, 같은 레시피는 빼고, 최대 10개까지만
      const otherIds = recentRecipes.filter((id) => id !== recipeId);
      const nextIds = [recipeId, ...otherIds].slice(0, MAX_RECENT_RECIPES);
      setRecentData({ userId, ids: nextIds });

      // DB에 저장 (이미 본 레시피면 본 시간만 지금으로 바꿈)
      await supabase
        .from('recent_recipes')
        .upsert(
          { user_id: userId, recipe_id: recipeId, viewed_at: new Date().toISOString() },
          { onConflict: 'user_id,recipe_id' },
        );

      // 10개를 넘어서 밀려난 레시피는 DB에서도 지우기
      const removedIds = otherIds.filter((id) => !nextIds.includes(id));
      if (removedIds.length > 0) {
        await supabase
          .from('recent_recipes')
          .delete()
          .eq('user_id', userId)
          .in('recipe_id', removedIds);
      }
    },
    [recentRecipes, userId],
  );

  const clearRecentlyViewed = useCallback(async () => {
    if (!userId || !supabase) return;

    // 화면에서 먼저 비우고, 내 기록을 DB에서 모두 지우기
    setRecentData({ userId, ids: EMPTY_LIST });
    await supabase.from('recent_recipes').delete().eq('user_id', userId);
  }, [userId]);

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
      clearRecentlyViewed,
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
      clearRecentlyViewed,
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
