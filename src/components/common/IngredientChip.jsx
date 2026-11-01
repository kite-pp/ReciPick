import styles from './IngredientChip.module.css';

// 재료 표시 칩
// 사용 예시
// <IngredientChip label="양파" />
// <IngredientChip label="양파" state="owned" />          // 보유 재료 (초록)
// <IngredientChip label="두부" state="missing" />        // 부족 재료 (노랑)
// <IngredientChip label="땅콩" state="selected" onRemove={() => handleRemove('땅콩')} />
// state: 'default'(기본) | 'selected' | 'owned' | 'missing'
// onRemove를 넘기면 × 버튼이 생김
function IngredientChip({ label, state = 'default', onRemove }) {
  let className = styles.chip;

  if (state === 'selected') {
    className = className + ' ' + styles.selected;
  } else if (state === 'owned') {
    className = className + ' ' + styles.owned;
  } else if (state === 'missing') {
    className = className + ' ' + styles.missing;
  }

  return (
    <span className={className}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={label + ' 삭제'}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default IngredientChip;
