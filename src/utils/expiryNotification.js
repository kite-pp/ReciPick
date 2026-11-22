import { getExpiryInfo } from './getExpiryInfo.js';

// getExpiryInfo 의 status → notification_logs 의 notification_type
// fresh(신선), unknown(기한 없음)은 알림 안 보냄
const STATUS_TO_TYPE = {
  soon: 'D-7',
  today: 'D-DAY',
  expired: 'EXPIRED',
};

// 냉장고 목록에서 알림 보낼 재료만 고르기
/* 형식 :
    fridgeList: FridgePage 에서 만든 목록 [{ id, expiresAt, ingredient: { name } }, ...]
    반환: [{ fridgeItemId: 3, type: 'D-DAY', name: '우유' }, ...]
*/
export const getExpiryNotificationTargets = (fridgeList) => {
  const targets = [];

  for (const item of fridgeList) {
    // 방금 추가해서 아직 DB id 가 없는 재료는 다음에
    if (!item.id) {
      continue;
    }

    const status = getExpiryInfo(item.expiresAt).status;
    const type = STATUS_TO_TYPE[status];

    if (!type) {
      continue;
    }

    targets.push({
      fridgeItemId: item.id,
      type: type,
      name: item.ingredient.name,
    });
  }

  return targets;
};

// 알림 내용 만들기 (여러 개면 하나로 묶어서 "우유 외 2개")
export const getExpiryNotificationMessage = (targets) => {
  let expiredCount = 0;
  for (const target of targets) {
    if (target.type === 'EXPIRED') {
      expiredCount++;
    }
  }

  let title = '소비기한이 임박한 재료가 있어요';
  if (expiredCount === targets.length) {
    title = '소비기한이 지난 재료가 있어요';
  }

  let body = `${targets[0].name}의 소비기한을 확인해 보세요.`;
  if (targets.length > 1) {
    body = `${targets[0].name} 외 ${targets.length - 1}개 재료의 소비기한을 확인해 보세요.`;
  }

  return { title, body };
};
