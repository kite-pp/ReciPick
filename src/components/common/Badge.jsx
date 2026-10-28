import styles from './Badge.module.css';

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
