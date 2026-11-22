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
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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