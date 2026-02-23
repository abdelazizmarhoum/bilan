import { useState, useEffect, useRef } from 'react';
import { extractText } from './api';
import { FileText, RefreshCw, Trash2, CheckCircle, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import Spinner from './components/Spinner';
import ItemRow from './components/ItemRow';
import Confetti from './components/Confetti';
import { classifyItems } from './utils/classify';

/* ─── Balance Table ──────────────────────────────────────────────── */
function GroupedBalanceTable({ title, items = [], loading = false }) {
  const groups = classifyItems(items, title);
  const total = items.reduce((s, it) => s + (Number(it.value) || 0), 0);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className={`glass rounded-2xl overflow-hidden flex flex-col h-full`}> 
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${title === 'Actif' ? 'bg-actif' : 'bg-passif'}`} />
            <h3 className={`text-base font-semibold tracking-wide text-white`}>{title}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-xs font-medium">{items.length} postes</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-white/[0.03] rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && groups.map((g, gi) => (
            <div key={gi} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-300">{g.title}</div>
                <div className="text-sm font-semibold text-slate-200">{g.total.toLocaleString('fr-MA')} DH</div>
              </div>

              <div className="overflow-hidden rounded border border-white/[0.03]">
                <table className="w-full text-sm">
                  <tbody>
                    {g.items.map((it, i) => (
                      <ItemRow key={i} item={it} side={title} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {!loading && (
            <div className="mt-2 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">Total</span>
              <span className="text-lg font-bold tabular-nums">{total.toLocaleString('fr-MA')} DH</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────────── */
export default function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const sample = `L'entreprise Yassir, spécialisée dans la vente de services informatiques, se présente comme suit : elle dispose d'un fonds commercial d'une valeur de 500000 DH, de locaux et équipements estimés à 2000000 DH, ainsi que d'un management et savoir-faire évalués à 500000 DH. À cela s'ajoutent des stocks de matériel informatique pour 300000 DH, des créances clients d'un montant de 200000 DH, et des disponibilités en caisse et banque de 150000 DH. Du côté des financements, l'entreprise est dotée d'un capital social de 1500000 DH, a contracté des emprunts bancaires pour 1200000 DH, et présente des dettes fournisseurs et fiscales de 350000 DH et 100000 DH respectivement. Enfin, le résultat de l'exercice s'élève à 500000 DH.`;

  const submit = async (e) => {
    e && e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const resp = await extractText(text || sample);
      setData(resp);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const actTotal = (data?.Actif || []).reduce((s, it) => s + (Number(it.value) || 0), 0);
  const passTotal = (data?.Passif || []).reduce((s, it) => s + (Number(it.value) || 0), 0);

  const [appliedCapital, setAppliedCapital] = useState(false);

  const displayedPassif = appliedCapital ? (data?.adjustedPassif || data?.Passif || []) : (data?.Passif || []);
  const displayedPassTotal = displayedPassif.reduce((s, it) => s + (Number(it.value) || 0), 0);

  const [showConfetti, setShowConfetti] = useState(false);
  const prevBalancedRef = useRef(false);

  useEffect(() => {
    const isBalancedNow = displayedPassTotal === actTotal && actTotal > 0;
    const wasBalanced = prevBalancedRef.current;
    if (isBalancedNow && !wasBalanced) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2600);
      return () => clearTimeout(t);
    }
    prevBalancedRef.current = isBalancedNow;
  }, [displayedPassTotal, actTotal]);

  /* Status indicator */
  const statusEl = loading ? (
    <Spinner size={16} label="Traitement" />
  ) : data ? (
    actTotal === passTotal ? (
      <div className="inline-flex items-center gap-1.5 bg-success-soft text-success border border-success/20 px-3 py-1 rounded-full text-xs font-semibold">
        <CheckCircle size={13} /> Équilibré
      </div>
    ) : (
      <div className="inline-flex items-center gap-1.5 bg-danger-soft text-danger border border-danger/20 px-3 py-1 rounded-full text-xs font-semibold">
        <AlertTriangle size={13} /> Déséquilibré
      </div>
    )
  ) : (
    <div className="inline-flex items-center gap-1.5 bg-white/5 text-slate-500 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
      En attente
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <header className="glass rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-actif to-blue-700 flex items-center justify-center shadow-glow-actif">
                <Package size={22} className="text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success rounded-full border-2 border-navy-900 shadow-glow-success" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Comptoir <span className="text-slate-500 font-light">—</span> Assistant Comptable
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Collez une description et laissez l'IA extraire le Bilan automatiquement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Statut</span>
            {statusEl}
          </div>
        </header>

        {/* ── Input Form ───────────────────────────────────────── */}
        <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Description financière
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full bg-navy-950/60 border border-white/[0.07] rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none transition-all duration-200 focus:outline-none focus:border-actif/50 focus:shadow-glow-actif focus:bg-navy-950/80"
            placeholder="Collez ici la description financière de l'entreprise…"
            disabled={loading}
          />

          <div className="flex flex-wrap gap-3">
            {/* Analyser */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-actif hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-glow-actif"
            >
              {loading
                ? <Spinner size={14} label="Traitement" />
                : <><FileText size={15} /> Analyser</>
              }
            </button>

            {/* Exemple */}
            <button
              type="button"
              disabled={loading}
              onClick={() => setText(sample)}
              className="inline-flex items-center gap-2 glass-sm hover:bg-white/[0.06] disabled:opacity-40 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
            >
              <RefreshCw size={15} /> Exemple
            </button>

            {/* Réinitialiser */}
            <button
              type="button"
              disabled={loading}
              onClick={() => { setText(''); setData(null); setError(null); setAppliedCapital(false); }}
              className="inline-flex items-center gap-2 glass-sm hover:bg-danger-soft hover:text-danger disabled:opacity-40 text-slate-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
            >
              <Trash2 size={15} /> Réinitialiser
            </button>
          </div>
        </form>

        {/* ── Error Banner ─────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-danger-soft border border-danger/20 text-danger rounded-xl px-5 py-4 text-sm font-medium animate-fade-in-up">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Balance Tables ───────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <GroupedBalanceTable title="Actif" items={data?.Actif || []} loading={loading} />
            <GroupedBalanceTable title="Passif" items={displayedPassif} loading={loading} />
          </div>

          {/* ── Summary & Reconciliation ─────────────────────── */}
          {(data || loading) && (
            <div className="glass rounded-2xl p-5 space-y-4 animate-fade-in-up">

              {/* Totals row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px] bg-actif-soft border border-actif/20 rounded-xl px-4 py-3">
                  <div className="text-[10px] uppercase tracking-widest text-actif/70 font-semibold mb-0.5">Total Actif</div>
                  <div className="text-lg font-bold text-actif tabular-nums">{actTotal.toLocaleString('fr-MA')} DH</div>
                </div>
                <div className="flex-1 min-w-[160px] bg-passif-soft border border-passif/20 rounded-xl px-4 py-3">
                  <div className="text-[10px] uppercase tracking-widest text-passif/70 font-semibold mb-0.5">Total Passif</div>
                  <div className="text-lg font-bold text-passif tabular-nums">{displayedPassTotal.toLocaleString('fr-MA')} DH</div>
                </div>

                {/* Balance state pill */}
                {data && (
                  <div className="flex items-center">
                    {data.reconciliation?.balanced || (appliedCapital && data.reconciliation?.balancedAfterApplyingCapital) ? (
                      <div className="inline-flex items-center gap-2 bg-success-soft border border-success/30 text-success px-4 py-2 rounded-xl font-semibold text-sm shadow-glow-success">
                        <CheckCircle size={16} /> Le bilan est équilibré
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-danger-soft border border-danger/30 text-danger px-4 py-2 rounded-xl font-semibold text-sm shadow-glow-danger">
                        <AlertTriangle size={16} /> Le bilan n'est pas équilibré
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reconciliation "Capital social" panel */}
              {data?.reconciliation?.capitalCalculated && !data?.reconciliation?.balanced && (
                <div className="border border-white/[0.07] rounded-xl p-4 space-y-4 bg-navy-950/40">

                  {/* Formula header */}
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-actif rounded-full" />
                    <h4 className="text-sm font-semibold text-slate-200">
                      Calcul du <span className="text-actif">Capital social</span> manquant
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 font-mono bg-navy-900 rounded-lg px-3 py-2 border border-white/[0.05]">
                    Capital social = Total Actif − Total Passif
                  </p>

                  {/* Breakdown chips */}
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="bg-actif-soft text-actif border border-actif/20 px-3 py-1.5 rounded-lg tabular-nums">
                      Actif : {data.reconciliation.originalTotalActif.toLocaleString('fr-MA')} DH
                    </span>
                    <span className="text-slate-600 self-center">−</span>
                    <span className="bg-passif-soft text-passif border border-passif/20 px-3 py-1.5 rounded-lg tabular-nums">
                      Passif : {data.reconciliation.originalTotalPassif.toLocaleString('fr-MA')} DH
                    </span>
                    <span className="text-slate-600 self-center">=</span>
                    <span className="bg-white/[0.07] text-white border border-white/10 px-3 py-1.5 rounded-lg font-bold tabular-nums">
                      {data.reconciliation.capitalValue?.toLocaleString('fr-MA')} DH
                    </span>
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1.5 rounded-lg text-[11px]">
                      Calculé automatiquement
                    </span>
                  </div>

                  {/* Apply / Remove toggle */}
                  <div>
                    {!appliedCapital ? (
                      <button
                        onClick={() => setAppliedCapital(true)}
                        className="inline-flex items-center gap-2 bg-success hover:bg-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-glow-success"
                      >
                        <CheckCircle size={15} /> Appliquer le capital calculé
                      </button>
                    ) : (
                      <button
                        onClick={() => setAppliedCapital(false)}
                        className="inline-flex items-center gap-2 glass-sm hover:bg-white/[0.06] text-slate-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
                      >
                        <Trash2 size={15} /> Retirer le capital appliqué
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Raw JSON debug (collapsible) */}
              {data && (
                <details className="text-xs text-slate-600 group">
                  <summary className="cursor-pointer select-none hover:text-slate-400 transition-colors duration-150 inline-flex items-center gap-1.5">
                    <span className="group-open:rotate-90 transition-transform duration-150 inline-block">▶</span>
                    Voir le JSON retourné
                  </summary>
                  <pre className="mt-3 p-4 bg-navy-950/60 border border-white/[0.05] rounded-xl overflow-auto text-[11px] text-slate-500 leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="text-center text-[11px] text-slate-700 pb-4">
          Backend : <code className="text-slate-600">POST /extract</code> sur{' '}
          <code className="text-slate-600">VITE_API_URL</code> (défaut : <code className="text-slate-600">http://localhost:3000</code>)
        </footer>
      </div>

      {/* ── Confetti overlay (logic unchanged) ─────────────────── */}
      {showConfetti && <Confetti show={true} duration={2500} />}

      {/* ── Full-screen loading overlay ─────────────────────────── */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center">
          <div className="glass rounded-2xl px-8 py-7 flex flex-col items-center gap-4 shadow-card">
            <Spinner size={26} label="Analyse en cours" />
            <p className="text-xs text-slate-500">L'IA extrait les postes comptables…</p>
          </div>
        </div>
      )}
    </div>
  );
}
