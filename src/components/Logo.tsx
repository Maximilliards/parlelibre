import { Link } from '@/lib/router';

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5 group">
      <img
        src="/logo1.png"
        alt="ParleLibre"
        className="h-9 w-9 rounded-xl object-contain transition-transform group-hover:scale-105"
      />
      <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
        Parle<span className="text-teal-600">Libre</span>
      </span>
    </Link>
  );
}
