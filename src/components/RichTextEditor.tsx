import { useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Quote,
  Undo2,
  Redo2,
} from 'lucide-react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
};

const ToolButton = ({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-md text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors"
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-stone-300 mx-0.5" />;

export function RichTextEditor({ value, onChange, placeholder, minHeight = '320px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML && !isInternalChange.current) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const emit = useCallback(() => {
    if (!ref.current) return;
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onChange]);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    ref.current?.focus();
    emit();
  };

  const handleLink = () => {
    const url = window.prompt('Entrez l\'URL du lien :');
    if (url) exec('createLink', url);
  };

  return (
    <div className="rounded-xl border border-stone-300 overflow-hidden focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-stone-50 border-b border-stone-200">
        <ToolButton onClick={() => exec('undo')} title="Annuler">
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('redo')} title="Rétablir">
          <Redo2 className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => exec('formatBlock', '<h1>')} title="Titre 1">
          <Heading1 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('formatBlock', '<h2>')} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('formatBlock', '<h3>')} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('formatBlock', '<p>')} title="Paragraphe">
          <span className="text-xs font-medium px-0.5">¶</span>
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => exec('bold')} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('italic')} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('underline')} title="Souligné">
          <Underline className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => exec('insertUnorderedList')} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('insertOrderedList')} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('formatBlock', '<blockquote>')} title="Citation">
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={handleLink} title="Lien">
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => exec('justifyLeft')} title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('justifyCenter')} title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('justifyRight')} title="Aligner à droite">
          <AlignRight className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => exec('justifyFull')} title="Justifier">
          <AlignJustify className="h-4 w-4" />
        </ToolButton>
      </div>

      <div
        ref={ref}
        contentEditable
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rich-editor px-4 py-3 outline-none text-stone-800 text-sm leading-relaxed overflow-y-auto"
        style={{ minHeight }}
      />
    </div>
  );
}
