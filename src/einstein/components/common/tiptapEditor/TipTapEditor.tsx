import styles from './TipTapEditor.module.scss';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import apiClient from '@/lib/config/axiosConfig';
import StarterKit from '@tiptap/starter-kit';

const Menubar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  return (
    <div className={`${styles['menu-bar']} flex items-center`}>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        Heading
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()}>Strike</button>
      <span>|</span>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
        Insert Table
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
      >
        Add Row
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
      >
        Delete Row
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
      >
        Add Column
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
      >
        Delete Column
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}
      >
        Toggle Header Cell
      </button>
      <button
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}
      >
        Merge/Split Cells
      </button>
      <ImageUpload editor={editor} />
    </div>
  );
};

export const ImageUpload = ({ editor }: { editor: Editor | null }) => {
  const handleImageUpload = async () => {
    if (!editor) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await apiClient.post('/how-to/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (response.data?.url) {
            editor
              .chain()
              .focus()
              .setImage({ src: response.data.url, style: 'max-width: 100%;' })
              .run();
          }
        } catch (err) {
          console.error('Image upload failed', err);
        }
      }
    };

    fileInput.click();
  };

  return <button onClick={handleImageUpload}>Upload Image</button>;
};

const ImageContextMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    let style = '';
    if (align === 'left') style = 'float: left; margin-right: 1em;';
    if (align === 'center') style = 'display: block; margin-left: auto; margin-right: auto;';
    if (align === 'right') style = 'float: right; margin-left: 1em;';
    editor.chain().focus().updateAttributes('image', { style }).run();
  };

  const setWidth = (width: string) => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', { style: `width: ${width};` })
      .run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }) => editor.isActive('image')}
    >
      <div className={styles['tiptap-context-menu']}>
        <div className={styles['context-menu-section']}>
          <h3>Alignment</h3>
          <div className={styles['context-menu-buttons']}>
            <button onClick={() => setAlignment('left')}>Left</button>
            <button onClick={() => setAlignment('center')}>Center</button>
            <button onClick={() => setAlignment('right')}>Right</button>
          </div>
        </div>
        <div className={styles['context-menu-section']}>
          <h3>Width</h3>
          <div className={styles['context-menu-buttons']}>
            <button onClick={() => setWidth('25%')}>25%</button>
            <button onClick={() => setWidth('50%')}>50%</button>
            <button onClick={() => setWidth('75%')}>75%</button>
            <button onClick={() => setWidth('100%')}>100%</button>
          </div>
        </div>
      </div>
    </BubbleMenu>
  );
};

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ value, onChange, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  return (
    <div style={{ fontFamily: "'Rubik', sans-serif" }}>
      <div>
        <Menubar editor={editor} />
      </div>
      <EditorContent
        editor={editor}
        className={`${styles['tiptap-editor']} ${className || ''}`}
        style={{ fontFamily: "'Rubik', sans-serif" }}
      />
      <ImageContextMenu editor={editor} />
    </div>
  );
};

export default TipTapEditor;
