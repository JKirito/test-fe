import styles from './TipTapEditor.module.scss';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
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
        const reader = new FileReader();

        reader.onload = async (e) => {
          if (e.target?.result) {
            const imageUrl = e.target.result as string;

            editor.chain().focus().setImage({ src: imageUrl }).run();
          }
        };

        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  };

  return <button onClick={handleImageUpload}>Upload Image</button>;
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
    </div>
  );
};

export default TipTapEditor;
