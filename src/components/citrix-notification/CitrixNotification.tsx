import { XCircleIcon } from 'lucide-react';
import styles from './CitrixNotification.module.scss';

interface CitrixNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitrixNotification = ({ isOpen, onClose }: CitrixNotificationProps) => {
  return (
    <>
      {isOpen && (
        <div className={styles.citrixNotification}>
          <p className={styles.citrixNotification__title}>
            To View Citrix Artefacts Please Access Einstein via Citrix
          </p>
          <button className={styles.citrixNotification__button} onClick={onClose}>
            <XCircleIcon width={21} height={21} />
          </button>
        </div>
      )}
    </>
  );
};
