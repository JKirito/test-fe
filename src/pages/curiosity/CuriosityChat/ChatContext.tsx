import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { IMessage } from './CuriosityChat'; // Assuming IMessage is defined here or can be imported

// Define the shape of the context state
interface ChatContextState {
  messages: IMessage[];
  sendMessage: (messageText: string) => void;
  // Add other shared state or functions here later (e.g., loading, errors, actions)
}

// Create the context with a default undefined value
const ChatContext = createContext<ChatContextState | undefined>(undefined);

// Define the props for the Provider component
interface ChatProviderProps {
  children: ReactNode;
  initialMessages?: IMessage[]; // Allow passing initial messages if needed
}

// Create the Provider component
export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  initialMessages = [], // Use mock data or fetch initial state here later
}) => {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);

  // Function to handle sending a new message
  const sendMessage = useCallback((messageText: string) => {
    // console.log('Sending message:', messageText); // Placeholder logic
    // In a real scenario, you would:
    // 1. Create a new message object (potentially with a pending status)
    // 2. Add it to the local 'messages' state for immediate UI update
    // 3. Make an API call to send the message to the backend
    // 4. Update the message status (e.g., delivered, error) based on API response

    const newMessage: IMessage = {
      id: `msg-${Date.now()}`, // Temporary ID generation
      sender: 'user', // Or determine sender dynamically
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // --- Placeholder for API call ---
    // simulateBackendResponse(newMessage);
  }, []);

  // Value provided by the context
  const contextValue: ChatContextState = {
    messages,
    sendMessage,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

// Custom hook for consuming the context
export const useChat = (): ChatContextState => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
