import { useState } from 'react';
import styles from './FridgeAlert.module.css';

const DISMISS_KEY = 'recipick:expiry-alert-dismissed';

const getInitialVisible = () => {
  if (!('Notification' in window)) return false; // 미지원 브라우저
  if (Notification.permission !== 'default') return false; // 이미 허용/차단
  try {
    return localStorage.getItem(DISMISS_KEY) !== 'true';
  } catch {
    return true;
  }
};

// <FridgeAlert onPermissionChange={(permission) => {}} />
function FridgeAlert({ onPermissionChange }) {
  const [visible, setVisible] = useState(getInitialVisible);

  const handleAllow = async () => {
    const permission = await Notification.requestPermission();

    // 팝업만 닫은 경우는 아직 고르지 않은 것이므로 배너를 그대로 둔다
    if (permission === 'default') return;

    setVisible(false);
    onPermissionChange?.(permission);
  };

  const handleLater = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      //  이번 화면에서만 숨긴다
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section className={styles.alert} aria-label="소비기한 알림 안내">
      {/* 종 아이콘 SVG (aria-hidden="true") */}
      <svg className={styles.icon} viewBox="0 -960 960 960" aria-hidden="true">
        {/* 헤더 종과 같은 Material Symbols 아이콘. 색은 CSS(color)를 따라감 */}
        <path
          fill="currentColor"
          d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"
        />
      </svg>
      <div className={styles.text}>
        <strong>소비기한 알림을 받아보세요</strong>
        <p>알림을 허용하면 소비기한이 임박한 재료를 앱에 접속할 때 알려드려요.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.laterButton} onClick={handleLater}>
          나중에
        </button>
        <button type="button" className={styles.allowButton} onClick={handleAllow}>
          알림 허용
        </button>
      </div>
    </section>
  );
}

export default FridgeAlert;
