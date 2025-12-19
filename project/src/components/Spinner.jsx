import { Loader } from 'lucide-react';

export default function Spinner({ size = 20, label = 'Traitement', variant = 'indigo' }) {
  const gradient = variant === 'indigo' ? 'from-indigo-500 to-blue-400' : 'from-amber-400 to-pink-500';

  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-3">
      <span className={`flex items-center justify-center w-9 h-9 rounded-full shadow-lg bg-gradient-to-br ${gradient}`}>
        <Loader className="animate-spin text-white" size={size} />
      </span>
      <span className="text-white font-medium">{label}…</span>
    </div>
  );
}
