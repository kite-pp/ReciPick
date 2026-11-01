import searchIcon from '../../assets/common/search.svg';
import styles from './SearchBar.module.css';

// 검색 입력창 (레시피 목록, 냉장고, 제외 재료 선택 등에서 사용)
// 사용 예시
// <SearchBar
//   id="recipe-search"
//   value={keyword}
//   onChange={(event) => setKeyword(event.target.value)}
//   onSubmit={handleSearch}
// />
// <SearchBar id="ingredient-search" label="재료 검색" placeholder="재료 이름 검색" value={...} onChange={...} />
// id는 label 연결 때문에 꼭 넣어주세요 (label은 화면에 안 보이고 스크린리더만 읽어요)
function SearchBar({
  id,
  label = '검색',
  value,
  onChange,
  onSubmit,
  placeholder = '재료나 요리명 검색',
}) {
  const handleSubmit = (event) => {
    event.preventDefault(); // 엔터 눌러도 새로고침 안 되게
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form className={styles.searchBar} role="search" onSubmit={handleSubmit}>
      <img className={styles.icon} src={searchIcon} alt="" />
      <label className={styles.srOnly} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </form>
  );
}

export default SearchBar;
