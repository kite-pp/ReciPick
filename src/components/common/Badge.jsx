import styles from './Badge.module.css';

// 작은 라벨(배지) 컴포넌트
// 카테고리, 난이도, 소비기한 상태 같은 거 표시할 때 사용
//
// 사용 예시
// <Badge>한식</Badge>
// <Badge color="black">추천</Badge>
// <Badge color="green">여유</Badge>
// <Badge color="yellow">D-2</Badge>
// <Badge color="red">소비기한 지남</Badge>
//
// color: 'gray'(기본) | 'black' | 'green' | 'yellow' | 'red'
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
