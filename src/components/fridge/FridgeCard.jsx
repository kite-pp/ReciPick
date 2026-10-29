import styles from './FridgeCard.module.css';
import { useState } from 'react';

function FridgeModal({ ingredient }) {

    // 갯수 구현 예정 localStorgge 에 어케 넣지
    const [quantity, setQuantity] = useState(1);
    
    const { id, name, category, image } = ingredient;

    
    return (
        <article className={styles.card}>
            <button className={styles.closeButton} > x </button>

            <div className={styles.header}>
                
            </div>
            <h2>{name}</h2>
            <p>번호: {id}</p>
            <p>분류: {category}</p>
            <img src={image} alt={name} height={100} />
        </article>
    );
}

export default FridgeModal;