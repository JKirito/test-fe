import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, MethodologyNode } from './types';
import apiClient from '@/lib/config/axiosConfig';
import { Loader, Plus } from 'lucide-react';
import Button from '@/einstein/components/common/Button';
import FetchDataError from '@/einstein/components/common/errors/FetchDataError';
import MethodologyTree from './tree/MethodologyTree';
import MethodologyEditor from './editor/MethodologyEditor';
import Modal from '@/einstein/components/common/Modal';
// import './MethodologyFormNew.scss';

const MethodologyFormNew: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<MethodologyNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  // Fetch all methodologies
  const {
    data: methodologies,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ['methodologies'],
    queryFn: async () => {
      const response = await apiClient.get('/methodologies/all');
      return response.data;
    },
  });

  // Mutation for deleting a node
  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      await apiClient.delete(`/methodologies/nodes/${nodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['methodologies'] });
    },
  });

  // Handle opening the editor for editing a node
  const handleEditNode = (node: MethodologyNode) => {
    setSelectedNode(node);
    setIsCreating(false);
    setIsEditorOpen(true);
  };

  // Handle opening the editor for creating a new node
  const handleAddNode = (parentNodeId: string | null = null) => {
    setSelectedNode(null);
    setIsCreating(true);
    setParentId(parentNodeId);
    setIsEditorOpen(true);
  };

  // Handle deleting a node
  const handleDeleteNode = async (nodeId: string) => {
    try {
      await deleteNodeMutation.mutateAsync(nodeId);
    } catch (error) {
      console.error('Error deleting node:', error);
      alert('Failed to delete node. Please try again.');
    }
  };

  // Handle saving a node (close the editor and refresh data)
  const handleSaveComplete = () => {
    setIsEditorOpen(false);
    queryClient.invalidateQueries({ queryKey: ['methodologies'] });
  };

  // Handle canceling the edit/create operation
  const handleCancelEdit = () => {
    setIsEditorOpen(false);
  };

  // Create a new top-level node
  const handleCreateTopLevel = () => {
    handleAddNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <FetchDataError />;
  }

  return (
    <div className="methodology-form-new">
      <div className="methodology-form-new__header flex items-center justify-between">
        <h2 className="methodology-form-new__title font-rubik text-xl m-0">
          Methodologies Content Management
        </h2>
        <Button
          variant="primary"
          onClick={handleCreateTopLevel}
          text="Add Top-Level Methodology"
          textClassName="text-white text-sm"
          icon={<Plus size={16} />}
        />
      </div>

      <div className="methodology-form-new__content">
        <MethodologyTree
          nodes={methodologies?.data || []}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNode}
          onAddChild={handleAddNode}
        />
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancelEdit}
        title={isCreating ? 'Create New Methodology' : 'Edit Methodology'}
        size="xl"
      >
        <MethodologyEditor
          node={selectedNode}
          onSave={handleSaveComplete}
          onCancel={handleCancelEdit}
          isCreating={isCreating}
          parentId={parentId}
        />
      </Modal>
    </div>
  );
};

export default MethodologyFormNew;
