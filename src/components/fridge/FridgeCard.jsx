import styles from './FridgeCard.module.css';
import { useState } from 'react';
import { useUserData } from '../../contexts/UserDataContext.jsx';
import { getExpiryInfo } from '../../utils/getExpiryInfo.js'

function FridgeModal({ ingredient }) {
    const { id, name, category, image } = ingredient;

    // UserDataContext 에 들어있는 localstorage 값 가져오기
    const { fridgeIngredients, updateFridgeIngredient, removeFridgeIngredient } = useUserData();


    /* fridgeIngredients 배열에서 현재 ingredient의 id와 일치하는 항목 찾기
    형식 :
    [
        {
            ingredientId: 1,
            quantity: 1,
            unit: '개',
            expiresAt: null,
            addedAt: '2026-10-29T11:29:29.981Z',
        },
    ]
    */




    const fridgeItem = fridgeIngredients.find((item) => {
        return item.ingredientId === id;
    });

    const quantity = fridgeItem?.quantity ?? 0;

    const handleIncrease = () => {

        updateFridgeIngredient(id, {
            quantity: quantity + 1,
        });
    };

    const handleDecrease = () => {

        updateFridgeIngredient(id, {
            quantity: quantity - 1,
        });
    };

    const handleRemove = () => {

        removeFridgeIngredient(id);
    };

    

    const expiryInfo = getExpiryInfo(fridgeItem?.expiresAt);

    return (
        <article className={styles.card}>
            <button className={styles.closeButton} onClick={() => {
                confirm("정말 삭제하시겠습니까?") && handleRemove();
            }}>×</button>

            <div className={styles.header}>
            <img className={styles.image} src={image} alt={name} />

            <div>
                <h2 className={styles.name}>{name}</h2>
                <p className={styles.category}>{category}</p>
            </div>
            </div>

            <span className={`${styles.expiry} ${styles[expiryInfo.status]}`}>{expiryInfo.label}</span>

            <div className={styles.divider} />

            <div className={styles.quantityRow}>
            <span>보유 수량</span>

            <div className={styles.quantityControl}>
                <button type="button" onClick={handleDecrease}>-</button>
                <strong>{fridgeItem?.quantity ?? 0}개</strong>
                <button type="button" onClick={handleIncrease}>+</button>
            </div>
            </div>
        </article>
    );
}

export default FridgeModal;
