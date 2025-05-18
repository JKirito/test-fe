import { HowToProvider } from './HowToContext';
import HowToDataView from './HowToDataView';
import HowToEditor from './editor';
import { useHowTo } from './HowToContext';
import Loader from '@/abacus/components/common/Loader';
import Filters from './Filters';
import ResizablePaneDivider from './ResizablePaneDivider';
import { useState, useCallback, useRef, useEffect } from 'react';
import Modal from '../../common/Modal';
import HowToContent from './content/HowToContent';
import './HowTo.scss';
import { HowToWithChildren, HowTo } from './types/howTo.types';

const HowToPageLayout = () => {
  const { filterOptions, selectedHowTo, howTos, setSelectedHowTo } = useHowTo();
  const [isEditorSaving, setIsEditorSaving] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(30); // 30% by default for tree view
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCreatingTopLevel, setIsCreatingTopLevel] = useState<boolean>(false);
  const [isCreatingSubsection, setIsCreatingSubsection] = useState<boolean>(false);
  const [editorKey, setEditorKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback((deltaX: number) => {
    setLeftPaneWidth((prevWidth) => {
      // Calculate new width percentage (constrained between 20% and 60%)
      const containerWidth = contentRef.current?.clientWidth || 1000;
      const deltaPercentage = (deltaX / containerWidth) * 100;
      const newWidth = Math.max(20, Math.min(60, prevWidth + deltaPercentage));
      return newWidth;
    });
  }, []);

  // Save the current split position to localStorage
  useEffect(() => {
    localStorage.setItem('howToLeftPaneWidth', leftPaneWidth.toString());
  }, [leftPaneWidth]);

  // Restore the saved split position from localStorage on initial load
  useEffect(() => {
    const savedWidth = localStorage.getItem('howToLeftPaneWidth');
    if (savedWidth) {
      const parsedWidth = parseFloat(savedWidth);
      if (!isNaN(parsedWidth) && parsedWidth >= 20 && parsedWidth <= 60) {
        setLeftPaneWidth(parsedWidth);
      }
    }
  }, []);

  // Effect to update selectedHowTo state when the underlying howTos array changes
  useEffect(() => {
    if (selectedHowTo?._id && howTos) {
      // Recursive function to find a node by ID in the tree structure
      const findNodeRecursively = (nodes: HowToWithChildren[], id: string): HowTo | null => {
        for (const node of nodes) {
          if (node._id === id) return node; // Return the node itself, not HowToWithChildren potentially
          if (node.children && node.children.length > 0) {
            const found = findNodeRecursively(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const updatedNode = findNodeRecursively(howTos, selectedHowTo._id);

      // If the node is found in the new array and its reference is different
      // from the currently selected one, update the state.
      // This ensures the view reflects the latest fetched data after an edit.
      if (updatedNode && updatedNode !== selectedHowTo) {
        // // console.log('[HowToPageLayout] Updating selectedHowTo state with fresh data.');
        setSelectedHowTo(updatedNode);
      }
      // If the node is *not* found (e.g., deleted externally), maybe clear selection?
      // else if (!updatedNode) { setSelectedHowTo(null); }
    }
    // Ensure setSelectedHowTo from context is stable or memoized if added as dependency
    // Or rely on the fact that useState setters are stable
  }, [howTos, selectedHowTo]); // Rerun when the data array or the selected ID changes

  // Open the editor modal with fresh editor instance for create/edit modes
  const openEditor = (mode: 'createTopLevel' | 'createSubsection' | 'edit') => {
    setIsCreatingTopLevel(mode === 'createTopLevel');
    setIsCreatingSubsection(mode === 'createSubsection');
    // bump key to remount HowToEditor
    setEditorKey((prev) => prev + 1);
    setIsEditorOpen(true);
  };

  const handleEdit = () => {
    openEditor('edit');
  };

  const handleCloseEditor = () => {
    // // console.log('[handleCloseEditor] Closing editor modal');
    setIsEditorOpen(false);
    setIsCreatingTopLevel(false);
    setIsCreatingSubsection(false); // Reset subsection state on close
  };

  const handleEditorSavingChange = (isSaving: boolean) => {
    setIsEditorSaving(isSaving);
  };

  // Listen for the createNewTopLevelHowTo event
  useEffect(() => {
    const handleCreateNewTopLevelHowTo = (event: Event) => {
      event.stopPropagation();
      openEditor('createTopLevel');
    };

    window.addEventListener('createNewTopLevelHowTo', handleCreateNewTopLevelHowTo);

    return () => {
      window.removeEventListener('createNewTopLevelHowTo', handleCreateNewTopLevelHowTo);
    };
  }, []);

  // Listen for the createNewSubsection event
  useEffect(() => {
    const handleCreateNewSubsection = (event: Event) => {
      event.stopPropagation();
      openEditor('createSubsection');
    };

    window.addEventListener('createNewSubsection', handleCreateNewSubsection);

    return () => {
      window.removeEventListener('createNewSubsection', handleCreateNewSubsection);
    };
  }, []);

  if (!filterOptions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 how-to-admin">
      {/* Filters Section */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <Filters filterOptions={filterOptions} />
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-hidden relative">
        {/* Left Panel - Data View - Scrollable */}
        <div
          className="border-r border-gray-200 bg-white overflow-y-auto absolute top-0 bottom-0 left-0"
          style={{ width: `${leftPaneWidth}%` }}
        >
          <HowToDataView />
        </div>

        {/* Resizable Divider - absolute positioned */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${leftPaneWidth}%`, height: '100%' }}
        >
          <ResizablePaneDivider onResize={handleResize} />
        </div>

        {/* Right Panel - Content Display - absolute positioned and fixed in view */}
        <div
          className="bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-200 absolute top-0 bottom-0 right-0"
          style={{
            width: `calc(${100 - leftPaneWidth}% - 2px)`, // Adjust for divider width
            left: `calc(${leftPaneWidth}% + 2px)`, // Position after divider
          }}
        >
          {selectedHowTo ? (
            <HowToContent selectedHowTo={selectedHowTo} onEdit={handleEdit} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center text-gray-500 text-xl mb-6">
                <p>Select a How-To item from the left panel to view its content.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        title={
          isCreatingTopLevel
            ? 'Create A Top Level Section'
            : isCreatingSubsection
              ? 'Create A New Subsection'
              : 'Edit How-To Content'
        }
        size="xl"
        preventClose={isEditorSaving}
      >
        <HowToEditor
          key={editorKey}
          onSaveComplete={handleCloseEditor}
          onSavingChange={handleEditorSavingChange}
          isCreating={isCreatingTopLevel || isCreatingSubsection}
        />
      </Modal>
    </div>
  );
};

const HowToPage = () => {
  return (
    <HowToProvider>
      <HowToPageLayout />
    </HowToProvider>
  );
};

export default HowToPage;
