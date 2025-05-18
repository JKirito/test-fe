import styles from './CuriosityChat.module.scss';
import { MockMessages } from './chat.mock';
import { RootState } from '@/lib/store/store';
import { getInitials } from '@/utils/utilities';
import { useSelector } from 'react-redux';
import CuriosityChatInput from './CuriosityChatInput';
import { ChatProvider, useChat } from './ChatContext';

export interface IMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  time: string;
}

const ChatContent = () => {
  const { messages } = useChat();
  const user = useSelector((state: RootState) => state.auth.user);
  const userInitials = getInitials(user?.name || '');

  return (
    <div className={styles.curiosityChat}>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={styles.message}
            style={{ alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {message.sender === 'user' ? (
              <div className={styles.messageContainer}>
                <div className={styles.userIcon}>{userInitials}</div>
                <div className={[styles.messageContent, styles.userMessage].join(' ')}>
                  {message.content}
                  <div className={styles.messageTime}>{message.time}</div>
                </div>
              </div>
            ) : (
              <div className={styles.messageContainer}>
                <img src="/icons/curiosity.svg" alt="curiosity" className={styles.messageIcon} />
                <div
                  className={[styles.messageContent, styles[message.sender + 'Message']].join(' ')}
                >
                  {message.content}
                  <div className={styles.messageTime}>{message.time}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <CuriosityChatInput />
    </div>
  );
};

const CuriosityChat = () => {
  return (
    <ChatProvider initialMessages={MockMessages}>
      <ChatContent />
    </ChatProvider>
  );
};

export default CuriosityChat;
