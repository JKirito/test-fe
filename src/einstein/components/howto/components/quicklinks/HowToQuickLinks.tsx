import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { HowToWithChildren } from '@/einstein/components/admin/howTo/types/howTo.types';
import './HowToQuickLinks.scss';

// Props for the recursive node component
interface QuickLinkNodeProps {
  node: HowToWithChildren;
  depth: number;
  selectedHowToId: string | null; // Add selected ID to track active state
  onLinkClick: (event: React.MouseEvent, id: string) => void;
}

/**
 * Renders a single node (and its children recursively) in the Quick Links hierarchy.
 */
const QuickLinkNode: React.FC<QuickLinkNodeProps> = ({
  node,
  depth,
  selectedHowToId,
  onLinkClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node._id === selectedHowToId; // Check if this node is the active one

  const toggleExpansion = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <li className="howto-quick-links__item" style={{ paddingLeft: `${depth * 12}px` }}>
      <div className="howto-quick-links__item-content">
        <a
          href={`#howto-item-${node._id}`}
          onClick={(e) => onLinkClick(e, node._id)}
          className={`howto-quick-links__link ${isActive ? 'howto-quick-links__link--active' : ''}`}
        >
          {node.title}
        </a>
        {hasChildren && (
          <button
            onClick={toggleExpansion}
            className="howto-quick-links__toggle-button"
            aria-label={isExpanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
      {/* Render children in a nested list if expanded */}
      {hasChildren && isExpanded && (
        <ul className="howto-quick-links__list howto-quick-links__list--nested">
          {node.children?.map((childNode) => (
            <QuickLinkNode
              key={childNode._id}
              node={childNode}
              depth={depth + 1}
              selectedHowToId={selectedHowToId}
              onLinkClick={onLinkClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Props for the main Quick Links component
interface HowToQuickLinksProps {
  nodes: HowToWithChildren[]; // Expect hierarchical data
  overviewNodeId: string | null; // ID for the overview link target
  selectedHowToId: string | null; // ID of the currently selected HowTo item
  onLinkClick: (event: React.MouseEvent, id: string) => void;
}

/**
 * Renders the container and initiates the recursive list of quick links.
 */
const HowToQuickLinks: React.FC<HowToQuickLinksProps> = ({
  nodes,
  selectedHowToId,
  onLinkClick,
}) => {
  return (
    <div className="howto-quick-links">
      <h4 className="howto-quick-links__title">Categories</h4>
      <ul className="howto-quick-links__list">
        {/* Render the rest of the hierarchy recursively */}
        {nodes.map((node) => (
          <QuickLinkNode
            key={node._id}
            node={node}
            depth={0} // Top-level items passed to QuickLinkNode start at depth 0
            selectedHowToId={selectedHowToId}
            onLinkClick={onLinkClick}
          />
        ))}
      </ul>
    </div>
  );
};

export default HowToQuickLinks;
