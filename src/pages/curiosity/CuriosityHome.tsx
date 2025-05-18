import CuriosityHeader from './CuriosityHeader';
import CuriositySidebar from './CuriositySidebar';
import CuriosityChat from './CuriosityChat';
import styles from './CuriosityHome.module.scss';
import CuriosityDemoModal from './CuriosityDemoModal';
import { useNavigate } from 'react-router-dom';

const CuriosityHome = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.curiosityHome}>
      <CuriosityDemoModal isOpen={true} onClose={navigateToHome} />
      <CuriosityHeader />
      <div className={styles.curiosityHomeContent}>
        <CuriositySidebar />
        <div className={styles.curiosityChatContainer}>
          <CuriosityChat />
        </div>
      </div>
    </div>
  );
};

export default CuriosityHome;
