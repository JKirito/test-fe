import React, { useState, useEffect } from 'react';
import { MethodologyNode, IExpert } from '../types';
import { Loader } from 'lucide-react';
import Button from '@/einstein/components/common/Button';
import apiClient from '@/lib/config/axiosConfig';
import styles from './MethodologyEditor.module.scss';
import NodeDetailsForm from './details/NodeDetailsForm';
import NodeExpertsForm from './experts/NodeExpertsForm';
import NodeAttachmentsForm from './attachments/NodeAttachmentsForm';

interface MethodologyEditorProps {
  node: MethodologyNode | null;
  onSave: () => void;
  onCancel: () => void;
  isCreating?: boolean;
  parentId?: string | null;
}

const MethodologyEditor: React.FC<MethodologyEditorProps> = ({
  node,
  onSave,
  onCancel,
  isCreating = false,
  parentId = null,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmittingAttachments, setIsSubmittingAttachments] = useState<boolean>(false);
  const [editedNode, setEditedNode] = useState<Partial<MethodologyNode> | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urlData, setUrlData] = useState<{ url: string; originalFileName: string }>({
    url: '',
    originalFileName: '',
  });
  const [uploadType, setUploadType] = useState<'document' | 'url'>('document');
  const [experts, setExperts] = useState<IExpert[]>([]);
  const [nodeType, setNodeType] = useState<'regular' | 'step'>('regular');
  const [documentType, setDocumentType] = useState<'framework' | 'template' | 'example'>(
    'framework'
  );

  // Initialize form with node data or create empty form for new node
  useEffect(() => {
    if (isCreating) {
      setEditedNode({
        name: '',
        description: '',
        nextLevelName: '',
        parentId: parentId,
        nodeType: 'regular',
        files: [],
        order: 0, // Default order for new nodes
      });
      setExperts([]);
      setNodeType('regular');
      setDocumentType('framework');
    } else if (node) {
      setEditedNode({
        ...node,
      });
      setExperts(node.experts || []);
      setNodeType(node.nodeType);
      // Set document type from existing file if available (use first file's type)
      if (node.files && node.files.length > 0) {
        setDocumentType(node.files[0].docType as 'framework' | 'template' | 'example');
      }
    }
  }, [node, isCreating, parentId]);

  if (!editedNode) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  const handleNodeChange = (updatedNode: Partial<MethodologyNode>) => {
    setEditedNode(updatedNode);
  };

  const handleFileSelection = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUrlDataChange = (newUrlData: { url: string; originalFileName: string }) => {
    setUrlData(newUrlData);
  };

  const handleSave = async () => {
    if (!editedNode) return;

    setIsLoading(true);
    try {
      // Prepare the base update data
      const updateData: any = {
        name: editedNode.name,
        description: editedNode.description,
        nextLevelName: editedNode.nextLevelName,
        experts: experts,
        nodeType: nodeType,
        order: editedNode.order !== undefined ? editedNode.order : 0, // Ensure order is included
      };

      // For creating a new node
      if (isCreating) {
        if (parentId) {
          updateData.parentId = parentId;
        }

        // If creating a new node and no explicit order is set,
        // get the max order of siblings to position it last
        if (editedNode.order === undefined) {
          try {
            const response = await apiClient.get('/methodologies/all');
            const siblings = response.data.data.filter(
              (n: MethodologyNode) => n.parentId === parentId
            );

            if (siblings.length > 0) {
              const maxOrder = Math.max(...siblings.map((s: MethodologyNode) => s.order || 0));
              updateData.order = maxOrder + 1;
            } else {
              updateData.order = 0;
            }
          } catch (error) {
            console.error('Error fetching siblings for order:', error);
            // Fallback to default order if fetching fails
            updateData.order = 0;
          }
        }

        // Handle file uploads if any
        if (selectedFiles.length > 0 || (uploadType === 'url' && urlData.url)) {
          // Create the node first without attachments
          const createResponse = await apiClient.post('/methodologies', updateData);
          const newNodeId = createResponse.data.data._id;

          // Then add each attachment one by one
          setIsSubmittingAttachments(true);
          await uploadAttachments(newNodeId);
          setIsSubmittingAttachments(false);
        } else {
          // Simple create without files
          await apiClient.post('/methodologies', updateData);
        }
      }
      // For updating an existing node
      else if (editedNode._id) {
        // First update the basic node data
        await apiClient.put(`/methodologies/${editedNode._id}`, updateData);

        // Then handle attachments if any are selected
        if (selectedFiles.length > 0 || (uploadType === 'url' && urlData.url)) {
          setIsSubmittingAttachments(true);
          await uploadAttachments(editedNode._id);
          setIsSubmittingAttachments(false);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving methodology:', error);
      alert('Failed to save methodology. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmittingAttachments(false);
    }
  };

  // Function to upload attachments to a node
  const uploadAttachments = async (nodeId: string) => {
    // Handle file uploads first
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', documentType);

        // If the file has a custom display name, use it
        if ((file as any).displayName && (file as any).displayName !== file.name) {
          formData.append('originalFileName', (file as any).displayName);
        }

        await apiClient.post(`/methodologies/${nodeId}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    }

    // Then handle URL if present
    if (uploadType === 'url' && urlData.url && urlData.originalFileName) {
      const formData = new FormData();
      formData.append('url', urlData.url);
      formData.append('originalFileName', urlData.originalFileName);
      formData.append('docType', documentType);

      await apiClient.post(`/methodologies/${nodeId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    if (!editedNode?._id) return;

    try {
      await apiClient.delete(`/methodologies/${editedNode._id}/files/${fileId}`);

      // Update local state to reflect the removal
      setEditedNode((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          files: prev.files?.filter((file) => file.fileId !== fileId) || [],
        };
      });
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Failed to remove file. Please try again.');
    }
  };

  return (
    <div className={styles.methodologyEditor}>
      <div className={styles.methodologyEditor__content}>
        {/* Basic Information Section */}
        <NodeDetailsForm
          node={editedNode}
          onNodeChange={handleNodeChange}
          nodeType={nodeType}
          onNodeTypeChange={setNodeType}
        />

        {/* Experts Section */}
        <NodeExpertsForm experts={experts} onExpertsChange={setExperts} />

        {/* Files Section */}
        <NodeAttachmentsForm
          files={editedNode.files || []}
          onRemoveFile={handleRemoveFile}
          onFileSelection={handleFileSelection}
          onUrlDataChange={handleUrlDataChange}
          selectedFiles={selectedFiles}
          uploadType={uploadType}
          urlData={urlData}
          onUploadTypeChange={setUploadType}
          documentType={documentType}
          onDocumentTypeChange={setDocumentType}
          isSubmitting={isSubmittingAttachments}
        />
      </div>

      <div className={styles.methodologyEditor__actions}>
        <Button
          variant="secondary"
          onClick={onCancel}
          text="Cancel"
          disabled={isLoading || isSubmittingAttachments}
        />
        <Button
          variant="primary"
          onClick={handleSave}
          text={isCreating ? 'Create' : 'Save Changes'}
          loading={isLoading}
          disabled={isSubmittingAttachments}
        />
      </div>
    </div>
  );
};

export default MethodologyEditor;
