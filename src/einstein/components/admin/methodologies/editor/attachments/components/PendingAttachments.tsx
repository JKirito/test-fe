import { FC } from 'react';
import { Trash2 } from 'lucide-react';

export interface PendingAttachment {
  id: string;
  displayName: string;
  documentTypeName: string;
  documentTypeId: string;
  file?: File;
  url?: string;
}

interface PendingAttachmentsProps {
  pendingAttachments: PendingAttachment[];
  onRemove: (attachmentId: string) => void;
}

export const PendingAttachments: FC<PendingAttachmentsProps> = ({
  pendingAttachments,
  onRemove,
}) => {
  if (!pendingAttachments.length) {
    return null;
  }

  return (
    <div className="mb-20 p-16 bg-primary-50 border border-primary-100 rounded-4">
      <h3 className="text-base font-semibold mb-12 text-primary-700">Pending Attachments</h3>
      <div className="flex flex-col gap-8">
        {pendingAttachments.map((attachment) => (
          <div key={attachment.id} className="bg-white rounded-4 border border-grayscale-200">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-grayscale-100 px-8 py-4 text-xs font-medium text-grayscale-700 rounded-2">
                {attachment.documentTypeName}
              </div>
              <div className="flex-1 p-12">
                <div className="font-medium text-grayscale-800 text-sm">
                  {attachment.displayName}
                </div>
                <div className="text-xs text-grayscale-600 mt-2">
                  {attachment.file ? (
                    <span className="truncate max-w-md inline-block">
                      File: {attachment.file.name}
                    </span>
                  ) : attachment.url ? (
                    <span className="truncate max-w-md inline-block">URL: {attachment.url}</span>
                  ) : null}
                </div>
                <div className="flex mt-8">
                  <button
                    type="button"
                    className="text-grayscale-500 hover:text-primary-600 p-4 rounded-4 hover:bg-primary-50 transition-colors"
                    onClick={() => onRemove(attachment.id)}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
