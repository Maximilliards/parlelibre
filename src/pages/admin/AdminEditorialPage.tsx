import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Star,
  StarOff,
  Search,
  Newspaper,
  Image as ImageIcon,
  Video,
  Youtube,
  Quote,
  FileText,
  Sparkles,
  Save,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export type EditorialType = 'image' | 'video' | 'youtube' | 'citation' | 'article' | 'highlight';
export type EditorialStatus = 'brouillon' | 'publie';

export interface EditorialContent {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  media_url: string | null;
  youtube_id: string | null;
  statut: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const TYPE_OPTIONS: { value: EditorialType; label: string; icon: typeof ImageIcon }[] = [
  { value: 'image', label: 'Image / Photo', icon: ImageIcon },
  { value: 'video', label: 'Vidéo', icon: Video },
  { value: 'youtube', label: 'Vidéo YouTube', icon: Youtube },
  { value: 'citation', label: 'Citation', icon: Quote },
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'highlight', label: 'Mise en avant', icon: Sparkles },
];

const TYPE_ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  youtube: Youtube,
  citation: Quote,
  article: FileText,
  highlight: Sparkles,
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function AdminEditorialPage() {
  const [items, setItems] = useState<EditorialContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditorialContent | null>(null);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<EditorialContent | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('editorial_contents').select('*').order('display_order', { ascending: true });
    if (filter !== 'all') q = q.eq('type', filter);
    const { data } = await q;
    setItems((data ?? []) as EditorialContent[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = search
    ? items.filter((i) => i.titre.toLowerCase().includes(search.toLowerCase()))
    : items;

  const save = async (data: Partial<EditorialContent> & { id?: string }) => {
    const payload = {
      type: data.type,
      titre: data.titre,
      contenu: data.contenu,
      media_url: data.media_url,
      youtube_id: data.type === 'youtube' && data.media_url ? extractYouTubeId(data.media_url) : data.youtube_id,
      statut: data.statut ?? 'brouillon',
      display_order: data.display_order ?? 0,
      is_featured: data.is_featured ?? false,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      await supabase.from('editorial_contents').update(payload).eq('id', data.id);
    } else {
      await supabase.from('editorial_contents').insert(payload);
    }
    setEditing(null);
    setCreating(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('editorial_contents').delete().eq('id', id);
    load();
  };

  const toggleFeatured = async (item: EditorialContent) => {
    await supabase
      .from('editorial_contents')
      .update({ is_featured: !item.is_featured, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    load();
  };

  const togglePublish = async (item: EditorialContent) => {
    const newStatus = item.statut === 'publie' ? 'brouillon' : 'publie';
    await supabase
      .from('editorial_contents')
      .update({ statut: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">Contenu éditorial</h1>
          <p className="text-sm text-stone-600 mt-1">
            Gérer les images, vidéos, citations, articles et contenus mis en avant.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Nouveau contenu
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ key: 'all', label: 'Tous' }, ...TYPE_OPTIONS.map((t) => ({ key: t.value, label: t.label }))].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`badge whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            className="input pl-9 w-full sm:w-64"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-500">Aucun contenu éditorial.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? FileText;
            return (
              <li key={item.id} className="card p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={`badge ${item.statut === 'publie' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-500'}`}>
                      {item.statut === 'publie' ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFeatured(item)}
                    className={`p-1.5 rounded transition-colors ${
                      item.is_featured ? 'text-amber-500 hover:bg-amber-50' : 'text-stone-300 hover:bg-stone-100'
                    }`}
                    title={item.is_featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                  >
                    {item.is_featured ? <Star className="h-4 w-4 fill-amber-400" /> : <StarOff className="h-4 w-4" />}
                  </button>
                </div>
                <h3 className="font-medium text-stone-900">{item.titre}</h3>
                {item.contenu && (
                  <p className="mt-1 text-sm text-stone-600 line-clamp-3 flex-1">{item.contenu}</p>
                )}
                {item.media_url && item.type === 'image' && (
                  <img src={item.media_url} alt={item.titre} className="mt-3 rounded-lg max-h-32 object-cover w-full" />
                )}
                {item.youtube_id && (
                  <div className="mt-3 relative rounded-lg overflow-hidden bg-stone-100 aspect-video">
                    <img
                      src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
                      alt={item.titre}
                      className="w-full h-full object-cover"
                    />
                    <Youtube className="absolute bottom-2 right-2 h-6 w-6 text-red-600 bg-white rounded p-0.5" />
                  </div>
                )}
                <div className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
                  <button onClick={() => setPreview(item)} className="btn-ghost text-xs">
                    <Eye className="h-3.5 w-3.5" /> Voir
                  </button>
                  <button onClick={() => setEditing(item)} className="btn-ghost text-xs">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button onClick={() => togglePublish(item)} className="btn text-xs bg-teal-50 text-teal-700 hover:bg-teal-100">
                    {item.statut === 'publie' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {item.statut === 'publie' ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => remove(item.id)} className="btn text-xs bg-red-50 text-red-600 hover:bg-red-100 ml-auto">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(editing || creating) && (
        <EditorialEditor
          item={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={save}
          onDelete={editing ? () => remove(editing.id) : undefined}
        />
      )}

      {preview && <PreviewModal item={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function EditorialEditor({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: EditorialContent | null;
  onClose: () => void;
  onSave: (data: Partial<EditorialContent> & { id?: string }) => void;
  onDelete?: () => void;
}) {
  const [type, setType] = useState<string>(item?.type ?? 'citation');
  const [titre, setTitre] = useState(item?.titre ?? '');
  const [contenu, setContenu] = useState(item?.contenu ?? '');
  const [mediaUrl, setMediaUrl] = useState(item?.media_url ?? '');
  const [statut, setStatut] = useState<string>(item?.statut ?? 'brouillon');
  const [displayOrder, setDisplayOrder] = useState(item?.display_order ?? 0);
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false);

  const canSave = titre.trim().length > 0;

  return (
    <Modal open onClose={onClose} title={item ? 'Modifier le contenu' : 'Nouveau contenu'} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="label">Type de contenu</label>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  type === t.value
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Titre</label>
          <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>

        {(type === 'citation' || type === 'article' || type === 'highlight') && (
          <div>
            <label className="label">{type === 'citation' ? 'Texte de la citation' : type === 'article' ? 'Contenu de l\'article' : 'Texte mis en avant'}</label>
            <textarea
              className={`input resize-y ${type === 'article' ? 'min-h-[200px]' : 'min-h-[100px]'}`}
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
            />
          </div>
        )}

        {(type === 'image' || type === 'video' || type === 'youtube') && (
          <div>
            <label className="label">
              {type === 'youtube' ? 'Lien YouTube (URL complète)' : type === 'image' ? 'URL de l\'image' : 'URL de la vidéo'}
            </label>
            <input
              className="input"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
            />
            {type === 'youtube' && mediaUrl && extractYouTubeId(mediaUrl) && (
              <p className="mt-1 text-xs text-teal-600">ID détecté : {extractYouTubeId(mediaUrl)}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Statut</label>
            <select className="input" value={statut} onChange={(e) => setStatut(e.target.value)}>
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
            </select>
          </div>
          <div>
            <label className="label">Ordre d'affichage</label>
            <input
              type="number"
              className="input"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-stone-700">Mettre en avant sur la page d'accueil</span>
        </label>

        <div className="flex justify-between pt-2">
          {onDelete ? (
            <button onClick={onDelete} className="btn-danger text-sm">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button
              onClick={() => onSave({ id: item?.id, type, titre, contenu, media_url: mediaUrl, statut, display_order: displayOrder, is_featured: isFeatured })}
              disabled={!canSave}
              className="btn-primary text-sm"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PreviewModal({ item, onClose }: { item: EditorialContent; onClose: () => void }) {
  const Icon = TYPE_ICONS[item.type] ?? FileText;
  return (
    <Modal open onClose={onClose} title="Aperçu" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-teal-600" />
          <h3 className="font-display text-lg font-semibold text-stone-900">{item.titre}</h3>
        </div>
        {item.type === 'image' && item.media_url && (
          <img src={item.media_url} alt={item.titre} className="rounded-xl w-full" />
        )}
        {item.type === 'youtube' && item.youtube_id && (
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${item.youtube_id}`}
              title={item.titre}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
        {item.contenu && (
          <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{item.contenu}</p>
        )}
      </div>
    </Modal>
  );
}
