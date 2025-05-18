import styles from './CuriosityHeader.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

const CuriosityHeader = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <div className={styles.curiosityHeader}>
      <img src="/icons/curiosity.svg" alt="curiosity" className={styles.curiosityHeaderIcon} />
      <div className={styles.curiosityHeaderTextContainer}>
        <p className={styles.curiosityHeaderText}>
          Let's Get Started, <span className={styles.userName}>{user?.name.split(' ')[0]}</span>{' '}
        </p>
        <p className={styles.curiosityHeaderSubText}>
          Get insights from Curiosity AI to benchmark against a use case
        </p>
      </div>
    </div>
  );
};

export default CuriosityHeader;
