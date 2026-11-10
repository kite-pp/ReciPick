import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '../utils/supabaseClient.js';

const PROFILE_COLUMNS =
  'preferred_categories, excluded_ingredient_ids, notify_expiry, notify_recommend, notify_shopping';

export const DEFAULT_PROFILE_SETTINGS = Object.freeze({
  preferredCategories: [],
  excludedIngredientIds: [],
  notifications: { expiry: true, recommendation: false, shopping: false },
});

// DB(snake_case) ↔ 앱(camelCase) 변환
function fromRow(row) {
  if (!row) return DEFAULT_PROFILE_SETTINGS;
  return {
    preferredCategories: row.preferred_categories ?? [],
    excludedIngredientIds: row.excluded_ingredient_ids ?? [],
    notifications: {
      expiry: row.notify_expiry,
      recommendation: row.notify_recommend,
      shopping: row.notify_shopping,
    },
  };
}

function toRow(settings) {
  return {
    preferred_categories: settings.preferredCategories,
    excluded_ingredient_ids: settings.excludedIngredientIds,
    notify_expiry: settings.notifications.expiry,
    notify_recommend: settings.notifications.recommendation,
    notify_shopping: settings.notifications.shopping,
  };
}

// 로그인한 사용자의 음식 취향·제외 재료·알림 설정을 Supabase profiles에 저장하고 불러옵니다.
// 닉네임은 헤더와 같은 기준인 AuthContext(user_metadata.nickname)에서 관리합니다.
export function useProfileSettings(userId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [loaded, setLoaded] = useState({
    key: null,
    settings: DEFAULT_PROFILE_SETTINGS,
    error: '',
  });
  const [saveError, setSaveError] = useState('');
  const [pendingSaves, setPendingSaves] = useState(0);
  const saveQueueRef = useRef(Promise.resolve());
  const latestSaveIdRef = useRef(0);

  const loadKey = userId && supabase ? `${userId}:${reloadCount}` : null;

  useEffect(() => {
    if (!loadKey) return undefined;

    let ignore = false;
    supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle()
      .then(
        ({ data, error }) => {
          if (ignore) return;
          setLoaded({
            key: loadKey,
            settings: error ? DEFAULT_PROFILE_SETTINGS : fromRow(data),
            error: error ? '설정을 불러오지 못했습니다.' : '',
          });
        },
        () => {
          if (ignore) return;
          setLoaded({
            key: loadKey,
            settings: DEFAULT_PROFILE_SETTINGS,
            error: '설정을 불러오지 못했습니다.',
          });
        },
      );

    return () => {
      ignore = true;
    };
  }, [loadKey, userId]);

  const reload = useCallback(() => {
    setSaveError('');
    setReloadCount((count) => count + 1);
  }, []);

  // 화면에 먼저 반영한 뒤 순서대로 저장합니다. 연속 변경 시 마지막 요청이 DB의 최종 값이 되며,
  // 마지막 요청이 실패했을 때만 오류를 표시하고 DB 값을 다시 불러와 되돌립니다.
  const saveSettings = useCallback(
    (nextSettings) => {
      if (!supabase || !userId) return Promise.resolve();

      const saveId = ++latestSaveIdRef.current;
      setLoaded((prev) => ({ ...prev, settings: nextSettings }));
      setSaveError('');
      setPendingSaves((count) => count + 1);

      const runSave = async () => {
        let failed;
        try {
          const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...toRow(nextSettings), updated_at: new Date().toISOString() });
          failed = Boolean(error);
        } catch {
          failed = true;
        } finally {
          setPendingSaves((count) => count - 1);
        }

        if (failed && saveId === latestSaveIdRef.current) {
          setSaveError('설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
          setReloadCount((count) => count + 1);
        }
      };

      saveQueueRef.current = saveQueueRef.current.then(runSave);
      return saveQueueRef.current;
    },
    [userId],
  );

  return {
    settings: loaded.settings,
    isLoading: Boolean(loadKey) && loaded.key !== loadKey,
    loadError: supabase ? loaded.error : 'Supabase 설정이 없어 설정을 불러올 수 없습니다.',
    saveError,
    isSaving: pendingSaves > 0,
    saveSettings,
    reload,
  };
}
