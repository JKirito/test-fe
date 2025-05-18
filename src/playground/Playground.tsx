import React from 'react';
import './Playground.scss';
import { CitrixNotification } from '../components/citrix-notification/CitrixNotification';
// import { FeedbackForm } from '@/components/feedback-form/FeedbackForm';
const Playground: React.FC = () => {
  return (
    <div className="playground">
      <CitrixNotification isOpen={true} onClose={() => {}} />
      {/* <FeedbackForm /> */}
    </div>
  );
};

export default Playground;
