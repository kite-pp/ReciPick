export const getExpiryInfo = (expiresAt) => {
        if (!expiresAt) {
            return {
                label: '정보 없음',
                status: 'unknown',
            };
        }

        const today = new Date();
        const expiryDate = new Date(`${expiresAt}T00:00:00`);

        today.setHours(0, 0, 0, 0);

        const difference = expiryDate - today;
        const remainingDays = difference / (1000 * 60 * 60 * 24);

        if (Number.isNaN(remainingDays)) {
            return {
                label: '정보 없음',
                status: 'unknown',
            };
        }

        if (remainingDays < 0) {
            return {
                label: '기한지남',
                status: 'expired',
            };
        }

        if (remainingDays === 0) {
            return {
                label: '오늘까지',
                status: 'today',
            };
        }

        if (remainingDays <= 3) {
            return {
                label: `임박  D-${remainingDays}`,
                status: 'soon',
            };
        }

        return {
            label: `신선  D-${remainingDays}`,
            status: 'fresh',
        };
    }