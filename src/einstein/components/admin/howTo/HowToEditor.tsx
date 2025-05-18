import React from 'react';
import HowToEditorComponent from './editor';

/**
 * HowToEditor component that has been refactored into smaller components
 * for better maintainability and single responsibility.
 *
 * The actual implementation is now in the ./editor directory.
 */
const HowToEditor: React.FC = () => {
  return <HowToEditorComponent />;
};

export default HowToEditor;
