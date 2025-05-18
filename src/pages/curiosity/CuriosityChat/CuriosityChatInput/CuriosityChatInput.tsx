import React, { useState } from 'react';
import styles from './CuriosityChatInput.module.scss';
import { useChat } from '../ChatContext'; // Import the hook
import { PlusCircleIcon } from 'lucide-react';

// Remove onSendMessage from props
interface CuriosityChatInputProps {
  // Placeholder functions for actions - implement logic later
  onAttachFile?: () => void;
  onSearchWeb?: () => void;
  onStartTranscription?: () => void;
}

const CuriosityChatInput: React.FC<CuriosityChatInputProps> = ({
  onAttachFile,
  onSearchWeb,
  onStartTranscription,
}) => {
  const { sendMessage } = useChat(); // Get sendMessage from context
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim()); // Use context's sendMessage
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      handleSend();
    }
  };

  return (
    <div className={styles.chatInputContainer}>
      <div className={styles.chatInputWrapper}>
        <input
          type="text"
          className={styles.textInput}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Let's get curious"
        />
        <div className={styles.actionsContainer}>
          {/* Placeholder Icons/Buttons - Replace with actual icons later */}
          <div className={styles.actionButtonsContainer}>
            <button className={styles.actionButton} onClick={onAttachFile} title="Attach File">
              <PlusCircleIcon width={20} height={20} />
            </button>
            <button className={styles.actionButton} onClick={onSearchWeb} title="Search Web">
              <img src="/icons/search-web.svg" alt="search" width={20} height={20} />
            </button>
            <button
              className={styles.actionButton}
              onClick={onStartTranscription}
              title="Use Microphone"
            >
              <img src="/icons/microphone.svg" alt="microphone" width={20} height={20} />
            </button>
          </div>
          {/* Optional: Add a dedicated send button if needed */}
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputValue.trim()} // Disable if input is empty
            title="Send Message"
          >
            <img src="/icons/send.svg" alt="send" width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuriosityChatInput;
