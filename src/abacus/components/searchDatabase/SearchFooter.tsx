import { Backpack } from 'lucide-react';
import styles from './SearchFooter.module.scss';
import { useNavigate } from 'react-router-dom';
const SearchFooter = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.searchFooter}>
      <button className={styles.searchFooter__button} onClick={() => navigate('/abacus-cost')}>
        <span className={styles.searchFooter__button__text}>Exit</span>
      </button>
    </div>
  );
};

export default SearchFooter;
