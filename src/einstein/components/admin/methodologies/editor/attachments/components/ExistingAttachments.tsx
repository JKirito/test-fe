import { FC } from 'react';
import { Trash2 } from 'lucide-react';

export interface ExistingAttachment {
  id: string;
  displayName: string;
  fileName: string;
  documentTypeName: string;
  documentTypeId: string;
}

interface ExistingAttachmentsProps {
  attachments: ExistingAttachment[];
  onRemove: (attachmentId: string) => void;
}

export const ExistingAttachments: FC<ExistingAttachmentsProps> = ({ attachments, onRemove }) => {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="mb-20">
      <h3 className="text-base font-semibold mb-12 text-grayscale-900">Existing Attachments</h3>
      <div className="flex flex-col gap-8">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="bg-white border border-grayscale-200 rounded-4 overflow-hidden"
          >
            <div className="flex">
              <div className="bg-grayscale-100 px-8 py-4 text-xs font-medium text-grayscale-700 rounded-2">
                {attachment.documentTypeName}
              </div>
              <div className="flex-1 pl-12">
                <div className="font-medium text-grayscale-800 text-sm">
                  {attachment.displayName}
                </div>
                <div className="text-xs text-grayscale-600 mt-1">
                  <span className="truncate max-w-md inline-block">{attachment.fileName}</span>
                </div>
                <div className="flex mt-4">
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
