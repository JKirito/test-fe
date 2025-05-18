import { useState, useMemo } from 'react';
import { useHowTo } from './HowToContext';
import { ChevronRight, ChevronDown, Plus, Trash2, Filter } from 'lucide-react';
import { HowToWithChildren } from './types/howTo.types';
import { Spinner } from '@/einstein/components/common/Spinner';
import apiClient from '@/lib/config/axiosConfig';
import '@/einstein/components/common/tiptapEditor/TipTapContent.module.scss';
import { sortHowTosRecursively } from './utils';

const NoFilterAppliedMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex flex-col items-center text-center text-gray-500 mb-6">
        <Filter className="h-12 w-12 text-blue-600 mb-4" />
        <p className="text-xl font-medium mb-2">Select Filters</p>
        <p className="text-gray-600">
          Please select the required filters (Sector, Subsector if applicable, and Build Type) to
          view the how-to content.
        </p>
      </div>
    </div>
  );
};

const TreeNode = ({
  node,
  depth = 0,
  parentExpanded = true,
}: {
  node: HowToWithChildren;
  depth?: number;
  parentExpanded?: boolean;
}) => {
  const { setSelectedHowTo, selectedHowTo, refreshHowTos } = useHowTo();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedHowTo?._id === node._id;

  if (!parentExpanded) return null;

  const handleSelect = () => {
    setSelectedHowTo(node);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      window.confirm(
        'Are you sure you want to delete this section and all its subsections? This action cannot be undone.'
      )
    ) {
      setIsDeleting(true);
      try {
        await apiClient.delete(`/how-to/${node._id}`);
        await refreshHowTos();
        // If the deleted node was selected, clear the selection
        if (selectedHowTo?._id === node._id) {
          setSelectedHowTo(null);
        }
      } catch (error) {
        console.error('Error deleting section:', error);
        alert('Failed to delete section. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCreateSubsection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Set the parent node as selected
    setSelectedHowTo(node);

    // Add createNew=true parameter to URL to signal the editor to create a new child
    const url = new URL(window.location.href);
    url.searchParams.set('createNew', 'true');
    url.searchParams.set('parentId', node._id);
    window.history.replaceState({}, '', url);

    // Expand the node if it has children
    if (hasChildren && !isExpanded) {
      setIsExpanded(true);
    }

    // Dispatch a custom event to notify the editor component
    window.dispatchEvent(
      new CustomEvent('createNewSubsection', {
        detail: {
          parentId: node._id,
          parentNode: node,
        },
      })
    );

    // Scroll to the editor section
    const editorElement = document.querySelector('.editor-section');
    if (editorElement) {
      editorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mb-2 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Node Header - Entire header is clickable to expand */}
      <div
        className={`flex items-center gap-2 p-2 transition-colors cursor-pointer
          ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white hover:bg-gray-50'}
          ${hasChildren ? 'font-medium' : 'font-normal'}`}
        style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}
        onClick={handleSelect}
      >
        {hasChildren && (
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-24 w-24 text-blue-600" />
            ) : (
              <ChevronRight className="h-24 w-24 text-blue-600" />
            )}
          </div>
        )}

        <div className="flex-1">
          <h3 className={`${isSelected ? 'text-blue-800' : 'text-gray-800'} text-lg`}>
            {node.title || 'Untitled Node'}
          </h3>
          {/* Description removed as we're now using Overview in the content section */}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="e-btn-export e-btn-with-icon e-btn-sm"
            aria-label="Delete section"
            title="Delete section"
            disabled={isDeleting}
            style={{ backgroundColor: 'var(--e-system-red-500)' }}
          >
            <Trash2 className="e-btn-icon" />
            <span className="hidden sm:inline text-white">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </span>
          </button>

          <button
            onClick={handleCreateSubsection}
            className="e-btn-apply e-btn-with-icon e-btn-sm"
            aria-label="Create new subsection"
            title="Create new subsection"
          >
            <Plus className="e-btn-icon" />
            <span className="hidden sm:inline text-white">Add New Section</span>
          </button>
        </div>
      </div>

      {/* Node Content removed - content will only be shown in the right panel when node is selected */}

      {/* Children (only shown when expanded) */}
      {hasChildren && node.children && node.children.length > 0 && (
        <div className={`border-t border-gray-200 ${!isExpanded ? 'hidden' : ''}`}>
          <div className="pl-3 pt-2 pb-2 space-y-3">
            {node.children.map((child) => (
              <TreeNode
                key={child._id}
                node={child}
                depth={depth + 1}
                parentExpanded={isExpanded}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const HowToDataView = () => {
  const { howTos, isLoading, appliedFilters, setSelectedHowTo } = useHowTo();

  // Memoize the sorted data
  const sortedHowTos = useMemo(() => sortHowTosRecursively(howTos || []), [howTos]);

  const handleCreateTopLevelHowTo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Clear any previously selected item before creating a top-level one
    setSelectedHowTo(null);
    // Create a custom event to trigger the creation of a new top-level HowTo
    const event = new CustomEvent('createNewTopLevelHowTo', {
      detail: {
        // Pass the currently applied filters when creating a top-level item
        filters: appliedFilters,
      },
    });
    window.dispatchEvent(event);
  };

  // Check if essential filters have been applied yet
  const areFiltersApplied = !!(
    (appliedFilters.sector && appliedFilters.buildType)
    // Lifecycle filter requirement removed
  );

  // If filters haven't been applied yet, show a message
  if (!areFiltersApplied) {
    return <NoFilterAppliedMessage />;
  }

  // Show loading state only when filters are applied and data is loading
  if (areFiltersApplied && isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Spinner className="h-24 w-24 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-xl">Loading how-to content...</span>
      </div>
    );
  }

  if (!sortedHowTos || sortedHowTos.length === 0) {
    return (
      <div className="flex flex-row items-center justify-between p-8">
        <div className="text-center text-gray-500 text-xl">
          <p className="m-0">No how-to content found</p>
        </div>
        <button
          onClick={handleCreateTopLevelHowTo}
          className="e-btn-apply e-btn-with-icon e-btn-md"
          style={{ flex: 'none', maxWidth: '300px' }}
        >
          <Plus className="e-btn-icon" />
          <span className="text-white">Create Section</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add New Top-Level Section Button */}
      <div className="flex justify-end p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={handleCreateTopLevelHowTo}
          className="e-btn-apply e-btn-with-icon e-btn-md"
          style={{ maxWidth: '300px' }}
        >
          <Plus className="e-btn-icon" />
          <span className="text-white">Add New Section</span>
        </button>
      </div>

      {/* Tree View */}
      <div className="my-3 pr-2 space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-200 hover:scrollbar-thumb-teal-500">
        {sortedHowTos.map((node) => (
          <TreeNode key={node._id} node={node} depth={0} parentExpanded={true} />
        ))}
      </div>
    </div>
  );
};

export default HowToDataView;
