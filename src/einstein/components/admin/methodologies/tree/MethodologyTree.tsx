import React, { useState } from 'react';
import { MethodologyNode } from '../types';
import MethodologyCard from '../card/MethodologyCard';
import './MethodologyTree.scss';

interface MethodologyTreeProps {
  nodes: MethodologyNode[];
  onEditNode: (node: MethodologyNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}

interface ExpandedState {
  [key: string]: boolean;
}

const MethodologyTree: React.FC<MethodologyTreeProps> = ({
  nodes,
  onEditNode,
  onDeleteNode,
  onAddChild,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<ExpandedState>({});

  // Function to toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Helper function to sort nodes by the order property
  const sortNodesByOrder = (nodesToSort: MethodologyNode[]): MethodologyNode[] => {
    return [...nodesToSort].sort((a, b) => {
      // If order property exists, sort by it
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If one node has order and the other doesn't, prioritize the one with order
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // Fallback to sorting by name
      return a.name.localeCompare(b.name);
    });
  };

  // Recursive function to render nodes and their children
  const renderNode = (node: MethodologyNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node._id] || false;
    const childNodes = nodes.filter((n) => n.parentId === node._id);
    const sortedChildNodes = sortNodesByOrder(childNodes);
    const hasChildren = childNodes.length > 0;

    return (
      <div key={node._id} className="methodology-tree__node">
        <MethodologyCard
          node={node}
          depth={depth}
          onEdit={onEditNode}
          onDelete={onDeleteNode}
          onAddChild={onAddChild}
          isExpanded={isExpanded}
          onToggleExpand={hasChildren ? () => toggleNodeExpansion(node._id) : undefined}
        />

        {hasChildren && isExpanded && (
          <div className="methodology-tree__children">
            {sortedChildNodes.map((childNode) => renderNode(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get top-level nodes (nodes with no parent)
  const topLevelNodes = nodes.filter((node) => node.parentId === null);
  // Sort top-level nodes by order
  const sortedTopLevelNodes = sortNodesByOrder(topLevelNodes);

  return (
    <div className="methodology-tree">
      {sortedTopLevelNodes.length > 0 ? (
        sortedTopLevelNodes.map((node) => renderNode(node))
      ) : (
        <div className="methodology-tree__empty">
          <p>No methodologies found. Add a new methodology to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MethodologyTree;
