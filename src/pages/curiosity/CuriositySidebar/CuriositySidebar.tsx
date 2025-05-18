import { Lightbulb } from 'lucide-react';
import sidebarStyles from './CuriositySidebar.module.scss';
import cardStyles from './SidebarCard/SidebarCard.module.scss';
import SidebarCard from './SidebarCard';

const CuriositySidebar = () => {
  return (
    <div className={sidebarStyles.curiositySidebar}>
      <SidebarCard>
        <Lightbulb width={24} height={24} />
        <div className={cardStyles.sidebarCardContent}>
          <p className={cardStyles.sidebarCardTitle}>Prompt Guidelines</p>
          <p className={cardStyles.sidebarCardDescription}>
            Quick tips for writing effective prompts: how to be clear, concise, and include key
            details.
          </p>
        </div>
      </SidebarCard>
      <SidebarCard style={{ marginTop: '24px' }}>
        <div className={sidebarStyles.flex}>
          <button className={sidebarStyles.button}>Download Chat</button>
          <button className={sidebarStyles.button}>Download References & Artefacts</button>
          <button className={sidebarStyles.button}>Download Templates</button>
          <button className={sidebarStyles.activeButton}>Launch Maps</button>
        </div>
      </SidebarCard>
    </div>
  );
};

export default CuriositySidebar;
