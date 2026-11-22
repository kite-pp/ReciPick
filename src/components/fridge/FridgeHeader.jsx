import fridgeIcon from '../../assets/common/fridge.svg';
import styles from './FridgeHeader.module.css';

// <FridgeHeader totalCount={12} freshCount={5} soonCount={4} onAdd={() => {}} />
function FridgeHeader({ totalCount, freshCount, soonCount, onAdd }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleBox}>
        <span className={styles.badge}>● 실시간 스마트 냉장고 모니터링</span>

        <div className={styles.titleRow}>
          <div className={styles.icon}>
            <img src={fridgeIcon} alt="" />
          </div>
          <h1>내 냉장고 관리</h1>
        </div>

        <p>
          보유한 식재료를 직관적으로 파악하고, 버려지는 재료 없이 똑똑한 맞춤형 레시피를
          추천받아보세요.
        </p>
      </div>

      <div className={styles.rightBox}>
        <div className={styles.countCard}>
          <div>
            <span>보관 중인 재료</span>
            <strong>
              {totalCount} <small>개</small>
            </strong>
          </div>

          <div className={styles.statusBadges}>
            <span className={styles.fresh}>● 신선 {freshCount}</span>
            <span className={styles.soon}>● 임박 {soonCount}</span>
          </div>
        </div>

        <button type="button" className={styles.addButton} onClick={onAdd}>
          ⊕ 식재료 추가
        </button>
      </div>
    </div>
  );
}

export default FridgeHeader;
