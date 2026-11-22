import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../contexts/useAuth.js';
import { useProfileSettings } from './useProfileSettings.js';
import { supabase } from '../utils/supabaseClient.js';
import {
  getExpiryNotificationMessage,
  getExpiryNotificationTargets,
} from '../utils/expiryNotification.js';

// 소비기한 임박·당일·만료 재료를 크롬 알림으로 알려주기
// 같은 재료 + 같은 종류 알림은 notification_logs 에 기록해서 한 번만 보냄
/* 사용 :
    useExpiryNotification(fridgeList, notificationPermission);
*/
export function useExpiryNotification(fridgeList, permission) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { settings, isLoading: isSettingsLoading } = useProfileSettings(userId);

  // 1. 알림 보낼 재료 고르기
  const targets = getExpiryNotificationTargets(fridgeList);

  // fridgeList 는 렌더링마다 새로 만들어져서, 대상이 바뀔 때만 실행되게 문자열로 비교
  // ex) "3:D-DAY,7:D-7"
  let targetKey = '';
  for (const target of targets) {
    targetKey += `${target.fridgeItemId}:${target.type},`;
  }

  useEffect(() => {
    // 2. 보낼 수 있는 상황인지 확인
    if (!('Notification' in window) || permission !== 'granted') return;
    if (!userId || !supabase || isSettingsLoading) return;
    if (!settings.notifications.expiry) return; // 마이페이지에서 소비기한 알림 끔
    if (targets.length === 0) return;

    let ignore = false;

    const rows = [];
    for (const target of targets) {
      rows.push({
        user_id: userId,
        fridge_item_id: target.fridgeItemId,
        notification_type: target.type,
      });
    }

    // 3. 기록하기 - 이미 보낸 (재료, 종류) 는 UNIQUE 제약 때문에 무시되고
    //    처음 기록된 것만 data 로 돌아옴 → 그것만 알림
    supabase
      .from('notification_logs')
      .upsert(rows, { onConflict: 'fridge_item_id,notification_type', ignoreDuplicates: true })
      .select('fridge_item_id, notification_type')
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error('알림 기록을 저장하지 못했어요.', error);
          return;
        }
        if (!data || data.length === 0) return;

        // 새로 기록된 것만 남기기
        const newTargets = [];
        for (const target of targets) {
          const isNew = data.some(
            (row) =>
              row.fridge_item_id === target.fridgeItemId && row.notification_type === target.type,
          );
          if (isNew) {
            newTargets.push(target);
          }
        }
        if (newTargets.length === 0) return;

        // 4. 크롬 알림 띄우기 (여러 개여도 하나로 묶어서)
        const message = getExpiryNotificationMessage(newTargets);
        const notification = new Notification(message.title, {
          body: message.body,
          tag: 'recipick-expiry', // 같은 tag 면 쌓이지 않고 바뀜
        });

        // 알림 누르면 냉장고 화면으로
        notification.onclick = () => {
          window.focus();
          navigate(ROUTES.fridge);
          notification.close();
        };
      });

    return () => {
      ignore = true;
    };
    // targets 대신 targetKey 로 비교 (위 주석 참고)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, permission, userId, isSettingsLoading, settings.notifications.expiry, navigate]);
}
