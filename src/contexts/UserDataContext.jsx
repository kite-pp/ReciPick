// src/contexts/UserDataContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { INGREDIENT_UNITS } from '../data/constants.js';
import { supabase } from '../utils/supabaseClient.js';
import { useAuth } from './useAuth.js';

const MAX_RECENT_RECIPES = 10;
// 로그아웃 상태에서 보여줄 빈 목록 (매번 새 배열을 만들지 않으려고 하나만 둠)
const EMPTY_LIST = [];

const UserDataContext = createContext(null);

const nowIso = () => new Date().toISOString();
// 저장해 둔 목록이 지금 계정 것이면 그 목록을, 아니면(계정이 바뀐 직후) 빈 목록을 돌려준다
const itemsOf = (data, userId) => (data.userId === userId ? data.items : EMPTY_LIST);
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

  // 저장이 실패하면 이 숫자를 올려서, DB에 있는 진짜 값으로 다시 불러온다 (화면 되돌리기)
  const [reloadCount, setReloadCount] = useState(0);

  // 화면을 바꾸고 저장을 시작한 횟수 (불러오는 동안 바뀌었는지 비교할 때 사용)
  const changeCountRef = useRef(0);
  // 아직 응답이 안 온 저장 요청 수
  const pendingSavesRef = useRef(0);
  // 다시 불러와야 하는데 저장 중이라 미뤄 둔 상태인지
  const needsReloadRef = useRef(false);

  // 진행 중인 저장이 모두 끝났을 때만 다시 불러오기
  // (저장 도중에 불러오면 아직 DB에 안 들어간 변경이 빠진 값을 받게 됨)
  const reloadWhenIdle = useCallback(() => {
    if (needsReloadRef.current && pendingSavesRef.current === 0) {
      needsReloadRef.current = false;
      setReloadCount((count) => count + 1);
    }
  }, []);

  // Supabase 저장 요청을 보내고, 실패하면 알려준 뒤 화면을 DB 값으로 되돌리기
  const saveToDb = useCallback(
    async (request) => {
      changeCountRef.current += 1;
      pendingSavesRef.current += 1;
      let result;
      try {
        result = await request;
      } catch (error) {
        // 요청 자체가 실패해도(네트워크 등) 저장 실패와 똑같이 처리
        result = { data: null, error };
      }
      pendingSavesRef.current -= 1;

      if (result.error) {
        console.error('저장하지 못했어요.', result.error);
        window.alert('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
        needsReloadRef.current = true;
      }
      reloadWhenIdle();
      return result;
    },
    [reloadWhenIdle],
  );

  // 불러오기를 시작한 뒤 화면이 바뀌었거나 아직 끝나지 않은 저장이 있으면,
  // 조회 결과는 버리고 저장이 모두 끝난 뒤 다시 불러오기
  // (버리지 않으면 이전 값으로 화면이 되돌아감 #110)
  const skipIfChanged = useCallback(
    (startChangeCount) => {
      const unchanged = changeCountRef.current === startChangeCount;
      if (unchanged && pendingSavesRef.current === 0) return false;
      needsReloadRef.current = true;
      reloadWhenIdle();
      return true;
    },
    [reloadWhenIdle],
  );

  // 냉장고 재료 목록과 "누구의 목록인지"를 같이 저장
  // 항목 모양: { id, ingredientId, quantity, unit, expiresAt, addedAt }
  // id는 DB의 fridge_items.id (알림 이력 notification_logs에서 사용, 추가 직후 잠깐 null)
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
    const startChangeCount = changeCountRef.current;

    supabase
      .from('fridge_items')
      .select('id, ingredient_id, quantity, unit, expires_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 넣은 게 앞
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (ignore) return;
        if (skipIfChanged(startChangeCount)) return;
        if (error) {
          console.error('냉장고 재료를 불러오지 못했어요.', error);
          // 처음 불러오기가 실패하면 빈 목록으로 로딩을 끝내고,
          // 이미 불러온 목록이 있으면(저장 실패 뒤 다시 불러오는 경우) 그대로 둔다
          setFridgeData((prev) => (prev.userId === userId ? prev : { userId, items: EMPTY_LIST }));
          return;
        }

        // DB 이름(ingredient_id, expires_at) → 앱 이름(ingredientId, expiresAt)으로 바꾸기
        const items = [];
        for (const row of data) {
          items.push({
            id: row.id,
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
  }, [userId, reloadCount, skipIfChanged]);

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
    const startChangeCount = changeCountRef.current;

    supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 찜한 게 앞
      .then(({ data, error }) => {
        if (ignore) return;
        if (skipIfChanged(startChangeCount)) return;
        if (error) {
          console.error('찜 목록을 불러오지 못했어요.', error);
          // 처음 불러오기가 실패하면 빈 목록으로 로딩을 끝내고,
          // 이미 불러온 목록이 있으면(저장 실패 뒤 다시 불러오는 경우) 그대로 둔다
          setFavoriteData((prev) => (prev.userId === userId ? prev : { userId, ids: EMPTY_LIST }));
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
  }, [userId, reloadCount, skipIfChanged]);

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
    const startChangeCount = changeCountRef.current;

    supabase
      .from('shopping_items')
      .select('ingredient_id, checked, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 최근에 담은 게 앞
      .order('id', { ascending: true }) // 한 번에 담은 재료는 담은 순서대로
      .then(({ data, error }) => {
        if (ignore) return;
        if (skipIfChanged(startChangeCount)) return;
        if (error) {
          console.error('장보기 목록을 불러오지 못했어요.', error);
          // 처음 불러오기가 실패하면 빈 목록으로 로딩을 끝내고,
          // 이미 불러온 목록이 있으면(저장 실패 뒤 다시 불러오는 경우) 그대로 둔다
          setShoppingData((prev) =>
            prev.userId === userId ? prev : { userId, items: EMPTY_LIST },
          );
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
  }, [userId, reloadCount, skipIfChanged]);

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
    const startChangeCount = changeCountRef.current;

    supabase
      .from('recent_recipes')
      .select('recipe_id')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false }) // 최근에 본 게 앞
      .limit(MAX_RECENT_RECIPES)
      .then(({ data, error }) => {
        if (ignore) return;
        if (skipIfChanged(startChangeCount)) return;
        if (error) {
          console.error('최근 본 레시피를 불러오지 못했어요.', error);
          // 처음 불러오기가 실패하면 빈 목록으로 로딩을 끝내고,
          // 이미 불러온 목록이 있으면(저장 실패 뒤 다시 불러오는 경우) 그대로 둔다
          setRecentData((prev) => (prev.userId === userId ? prev : { userId, ids: EMPTY_LIST }));
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
  }, [userId, reloadCount, skipIfChanged]);

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
      if (!userId || !supabase) return false;

      // 화면 맨 앞에 먼저 넣기
      const newItem = { id: null, ingredientId, quantity, unit, expiresAt, addedAt: nowIso() };
      setFridgeData((prev) => ({ userId, items: [newItem, ...itemsOf(prev, userId)] }));

      // DB에 저장하고, 새로 만들어진 id를 받아오기
      const { data, error } = await saveToDb(
        supabase
          .from('fridge_items')
          .insert({
            user_id: userId,
            ingredient_id: ingredientId,
            quantity,
            unit,
            expires_at: expiresAt,
          })
          .select('id')
          .single(),
      );

      if (error) {
        // 저장에 실패하면 화면에 먼저 넣었던 재료를 바로 빼기
        // (남겨 두면 다시 시도할 때 "이미 냉장고에 있음"으로 보여 저장을 건너뛰게 됨)
        setFridgeData((prev) => ({
          userId,
          items: itemsOf(prev, userId).filter((item) => item !== newItem),
        }));
        return false;
      }

      // 화면에 먼저 넣어둔 항목에 DB id 채우기 (알림 기록 notification_logs 에서 사용)
      setFridgeData((prev) => ({
        userId,
        items: itemsOf(prev, userId).map((item) =>
          item.ingredientId === ingredientId ? { ...item, id: data.id } : item,
        ),
      }));

      // 저장에 성공하면 true, 실패하면 false (장보기에서 옮길 때 성공한 것만 지우려고)
      return true;
    },
    [isInFridge, userId, saveToDb],
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
        items: itemsOf(prev, userId).map((item) =>
          item.ingredientId === ingredientId ? { ...item, ...changes } : item,
        ),
      }));

      // DB 이름으로 바꿔서 저장 (expiresAt → expires_at)
      const dbChanges = pickDefined({ quantity, unit, expires_at: expiresAt });
      await saveToDb(
        supabase
          .from('fridge_items')
          .update(dbChanges)
          .eq('user_id', userId)
          .eq('ingredient_id', ingredientId),
      );
    },
    [isInFridge, userId, saveToDb],
  );

  const removeFridgeIngredient = useCallback(
    async (ingredientId) => {
      if (!userId || !supabase) return;

      // 화면에서 먼저 빼기
      setFridgeData((prev) => ({
        userId,
        items: itemsOf(prev, userId).filter((item) => item.ingredientId !== ingredientId),
      }));

      // DB에서 삭제
      await saveToDb(
        supabase
          .from('fridge_items')
          .delete()
          .eq('user_id', userId)
          .eq('ingredient_id', ingredientId),
      );
    },
    [userId, saveToDb],
  );

  // ---------- 찜 ----------
  const isFavorite = useCallback((recipeId) => favorites.includes(recipeId), [favorites]);

  const toggleFavorite = useCallback(
    async (recipeId) => {
      if (!userId || !supabase) return;

      if (favorites.includes(recipeId)) {
        // 이미 찜했으면 → 해제: 화면에서 먼저 빼고 DB에서 삭제
        setFavoriteData({ userId, ids: favorites.filter((id) => id !== recipeId) });
        await saveToDb(
          supabase.from('favorites').delete().eq('user_id', userId).eq('recipe_id', recipeId),
        );
      } else {
        // 찜 안 했으면 → 추가: 화면 맨 앞에 넣고 DB에 저장
        setFavoriteData({ userId, ids: [recipeId, ...favorites] });
        await saveToDb(supabase.from('favorites').insert({ user_id: userId, recipe_id: recipeId }));
      }
    },
    [favorites, userId, saveToDb],
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
      setShoppingData((prev) => ({ userId, items: [...newItems, ...itemsOf(prev, userId)] }));

      // DB에 저장 (혹시 이미 있으면 그대로 두기)
      const rows = newIds.map((id) => ({ user_id: userId, ingredient_id: id, checked: false }));
      await saveToDb(
        supabase
          .from('shopping_items')
          .upsert(rows, { onConflict: 'user_id,ingredient_id', ignoreDuplicates: true }),
      );
    },
    [shoppingList, userId, saveToDb],
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
        items: itemsOf(prev, userId).map((item) =>
          item.ingredientId === ingredientId ? { ...item, checked: nextChecked } : item,
        ),
      }));

      // DB에도 체크 상태 저장
      await saveToDb(
        supabase
          .from('shopping_items')
          .update({ checked: nextChecked })
          .eq('user_id', userId)
          .eq('ingredient_id', ingredientId),
      );
    },
    [shoppingList, userId, saveToDb],
  );

  const removeShoppingItem = useCallback(
    async (ingredientId) => {
      if (!userId || !supabase) return;

      // 화면에서 먼저 빼기
      // ("구매 완료 삭제"는 여러 개를 연달아 지우기 때문에, 이전 상태(prev)를 기준으로 빼야 다 지워짐)
      setShoppingData((prev) => ({
        userId,
        items: itemsOf(prev, userId).filter((item) => item.ingredientId !== ingredientId),
      }));

      // DB에서 삭제
      await saveToDb(
        supabase
          .from('shopping_items')
          .delete()
          .eq('user_id', userId)
          .eq('ingredient_id', ingredientId),
      );
    },
    [userId, saveToDb],
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
      await saveToDb(
        supabase
          .from('recent_recipes')
          .upsert(
            { user_id: userId, recipe_id: recipeId, viewed_at: new Date().toISOString() },
            { onConflict: 'user_id,recipe_id' },
          ),
      );

      // 10개를 넘어서 밀려난 레시피는 DB에서도 지우기
      const removedIds = otherIds.filter((id) => !nextIds.includes(id));
      if (removedIds.length > 0) {
        await saveToDb(
          supabase
            .from('recent_recipes')
            .delete()
            .eq('user_id', userId)
            .in('recipe_id', removedIds),
        );
      }
    },
    [recentRecipes, userId, saveToDb],
  );

  const clearRecentlyViewed = useCallback(async () => {
    if (!userId || !supabase) return;

    // 화면에서 먼저 비우고, 내 기록을 DB에서 모두 지우기
    setRecentData({ userId, ids: EMPTY_LIST });
    await saveToDb(supabase.from('recent_recipes').delete().eq('user_id', userId));
  }, [userId, saveToDb]);

  // 로그인했는데 아직 4가지 데이터를 다 불러오지 못했으면 로딩 중
  let isLoading = false;
  if (userId && supabase) {
    isLoading =
      fridgeData.userId !== userId ||
      favoriteData.userId !== userId ||
      shoppingData.userId !== userId ||
      recentData.userId !== userId;
  }

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
      isLoading,
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
      isLoading,
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
