export default function Spinner({ size = 20, label = 'Traitement' }) {
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-3">
      {/* CSS ring spinner */}
      <span
        className="inline-block rounded-full border-2 border-white/20 border-t-actif animate-spin shrink-0"
        style={{ width: size + 8, height: size + 8 }}
        aria-hidden
      />
      <span className="text-slate-300 font-medium text-sm tracking-wide">{label}…</span>
    </div>
  );
}
