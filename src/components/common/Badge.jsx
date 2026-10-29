import styles from './Badge.module.css';

// 사용 예시
// <Badge>한식</Badge>
// <Badge color="red">오늘까지</Badge>
// color: 'gray'(기본, 카테고리·난이도) | 'green'(일치율, fresh) | 'yellow'(soon)
//        | 'red'(today) | 'black'(expired)
function Badge({ children, color = 'gray' }) {
  let colorClassName = styles.gray;
  if (color === 'black') {
    colorClassName = styles.black;
  } else if (color === 'green') {
    colorClassName = styles.green;
  } else if (color === 'yellow') {
    colorClassName = styles.yellow;
  } else if (color === 'red') {
    colorClassName = styles.red;
  }

  return <span className={styles.badge + ' ' + colorClassName}>{children}</span>;
}

export default Badge;
