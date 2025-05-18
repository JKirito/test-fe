import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus, FileText } from 'lucide-react';
import { MethodologyNode } from '../types';
import './MethodologyCard.scss';

interface MethodologyCardProps {
  node: MethodologyNode;
  depth?: number;
  onEdit?: (node: MethodologyNode) => void;
  onDelete?: (nodeId: string) => void;
  onAddChild?: (parentId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const MethodologyCard: React.FC<MethodologyCardProps> = ({
  node,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(node);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this methodology?')) {
      onDelete(node._id);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddChild) onAddChild(node._id);
  };

  const toggleContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsContentExpanded(!isContentExpanded);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) onToggleExpand();
  };

  // Group files by document type
  const groupedFiles =
    node.files?.reduce(
      (acc, file) => {
        if (!acc[file.docType]) {
          acc[file.docType] = [];
        }
        acc[file.docType].push(file);
        return acc;
      },
      {} as Record<string, typeof node.files>
    ) || {};

  return (
    <div className={`methodology-card methodology-card--depth-${depth}`}>
      <div
        className={`methodology-card__header ${isExpanded ? 'methodology-card__header--expanded' : ''}`}
        onClick={handleToggleExpand}
      >
        <div className="methodology-card__expand-icon" onClick={handleToggleExpand}>
          {onToggleExpand && (isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />)}
        </div>

        <div className="methodology-card__title">
          {node.order !== undefined && (
            <span className="methodology-card__order">{node.order}:</span>
          )}
          {node.name}
        </div>

        {node.experts && node.experts.length > 0 && (
          <div className="methodology-card__experts">
            {node.experts.slice(0, 3).map((expert, index) => (
              <div key={index} className="methodology-card__expert-avatar" title={expert.name}>
                {expert.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </div>
            ))}
            {node.experts.length > 3 && (
              <div className="methodology-card__expert-avatar methodology-card__expert-avatar--more">
                +{node.experts.length - 3}
              </div>
            )}
          </div>
        )}

        {node.files && node.files.length > 0 && (
          <button
            className={`methodology-card__files-toggle ${isContentExpanded ? 'methodology-card__files-toggle--expanded' : ''}`}
            onClick={toggleContent}
          >
            <FileText size={18} />
            <span>
              {node.files.length} file{node.files.length !== 1 ? 's' : ''}
            </span>
          </button>
        )}

        <div className="methodology-card__actions">
          <button
            className="methodology-card__action-btn"
            onClick={handleAddChild}
            title="Add Child"
          >
            <Plus size={16} />
          </button>
          <button className="methodology-card__action-btn" onClick={handleEdit} title="Edit">
            <Edit size={16} />
          </button>
          <button
            className="methodology-card__action-btn methodology-card__action-btn--delete"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {isContentExpanded && node.files && node.files.length > 0 && (
        <div className="methodology-card__content">
          {Object.entries(groupedFiles).map(([docType, files]) => (
            <div key={docType} className="methodology-card__file-group">
              <h4 className="methodology-card__file-group-title">
                {docType.charAt(0).toUpperCase() + docType.slice(1)}
              </h4>
              <div className="methodology-card__file-list">
                {files.map((file) => (
                  <a
                    key={file.fileId}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="methodology-card__file-link"
                  >
                    <FileText size={16} className="methodology-card__file-icon" />
                    <span>{file.originalFileName}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MethodologyCard;
