import { useEffect, type FC } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export interface RichTextEditorProps {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaLabelledBy?: string;
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder,
  id,
  onBlur,
  ariaDescribedBy,
  ariaInvalid,
  ariaLabelledBy,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const currentHtml = editor.getHTML();
    if (currentHtml === value) {
      return;
    }
    editor.commands.setContent(value || '<p></p>', false);
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || !ariaLabelledBy) {
      return;
    }

    const labelElement = document.getElementById(ariaLabelledBy);
    if (!labelElement) {
      return;
    }

    const focusEditor = () => {
      editor.commands.focus();
    };

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      focusEditor();
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        focusEditor();
      }
    };

    labelElement.addEventListener('click', handleClick);
    labelElement.addEventListener('keydown', handleKey);

    return () => {
      labelElement.removeEventListener('click', handleClick);
      labelElement.removeEventListener('keydown', handleKey);
    };
  }, [editor, ariaLabelledBy]);

  if (!editor) {
    return null;
  }

  const toolbarButtonClass =
    'px-2 py-1 border border-gray-200 rounded-md text-sm text-gray-600 transition hover:text-gray-900 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';

  return (
    <div className="space-y-2" id={id ? `${id}-wrapper` : undefined}>
      <div className="flex gap-1" role="toolbar" aria-label="Редактирование текста">
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Полужирный"
          aria-pressed={editor.isActive('bold')}
          disabled={disabled}
        >
          B
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Курсив"
          aria-pressed={editor.isActive('italic')}
          disabled={disabled}
        >
          I
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Маркированный список"
          aria-pressed={editor.isActive('bulletList')}
          disabled={disabled}
        >
          •
        </button>
      </div>
      <div
        className={`border rounded-lg text-sm ${
          disabled ? 'bg-gray-50 text-gray-400' : 'focus-within:ring-2 focus-within:ring-blue-500'
        }`}
      >
        {!disabled && !editor.state.doc.textContent && placeholder ? (
          <p className="px-3 py-2 text-gray-400 select-none" aria-hidden="true">
            {placeholder}
          </p>
        ) : null}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-3 py-2 outline-none"
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || undefined}
          aria-labelledby={ariaLabelledBy}
          role="textbox"
          aria-multiline="true"
          onBlur={onBlur}
        />
      </div>
    </div>
  );
};
