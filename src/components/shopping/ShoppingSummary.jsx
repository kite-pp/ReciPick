import styles from './ShoppingListPage.module.css';

function ShoppingSummary({ totalCount, checkedCount }) {
  const summaryItems = [
    { label: '전체 재료', value: totalCount, caption: '장보기에 담은 재료' },
    { label: '구매 완료', value: checkedCount, caption: '체크한 항목' },
    { label: '남은 재료', value: totalCount - checkedCount, caption: '오늘 장볼 항목' },
  ];

  return (
    <div className={styles.summary}>
      {summaryItems.map((summary) => (
        <div key={summary.label} className={styles.summaryCard}>
          <span>{summary.label}</span>
          <strong>{summary.value}개</strong>
          <p>{summary.caption}</p>
        </div>
      ))}
    </div>
  );
}

export default ShoppingSummary;
