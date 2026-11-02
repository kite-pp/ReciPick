import MyPageSettings from '../components/mypage/MyPageSettings.jsx';
import MyPageSummary from '../components/mypage/MyPageSummary.jsx';
import { useAuth } from '../contexts/useAuth.js';
import { useUserData } from '../contexts/UserDataContext.jsx';

function MyPage() {
  const { user } = useAuth();
  const { fridgeIngredients, favorites, recentRecipes, shoppingList } = useUserData();

  // 화면에 보여줄 이름 (닉네임 없으면 이메일 앞부분, Header와 같은 규칙)
  let userName = '';
  if (user) {
    if (user.user_metadata && user.user_metadata.nickname) {
      userName = user.user_metadata.nickname;
    } else {
      userName = user.email.split('@')[0];
    }
  }

  // 장보기 목록 중 아직 체크 안 한 것만 세기
  const notBoughtCount = shoppingList.filter((item) => !item.checked).length;

  return (
    <>
      <MyPageSummary
        userName={userName}
        fridgeCount={fridgeIngredients.length}
        favoriteCount={favorites.length}
        recentCount={recentRecipes.length}
        shoppingCount={notBoughtCount}
      />
      <MyPageSettings />
    </>
  );
}

export default MyPage;
