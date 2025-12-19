import { useState } from 'react';
import { extractText } from './api';
import { FileText, RefreshCw, Trash2, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import Spinner from './components/Spinner';
import ItemRow from './components/ItemRow';

function BalanceTable({ title, items = [], loading = false }) {
  const total = items.reduce((s, it) => s + (Number(it.value) || 0), 0);

  return (
    <div className="w-full md:w-1/2 p-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        {title === 'Actif' ? <span className="text-indigo-600">●</span> : <span className="text-amber-600">●</span>}
        {title}
      </h3>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-right">Valeur (DH)</th>
              <th className="p-2 text-right">Compte</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t animate-pulse">
                  <td className="p-2 h-6 bg-gray-100" />
                  <td className="p-2 h-6 bg-gray-100" />
                  <td className="p-2 h-6 bg-gray-100" />
                </tr>
              ))
            )}

            {!loading && items.map((it, i) => (
              <ItemRow key={i} item={it} side={title} />
            ))}

            {!loading && (
              <tr className="font-semibold border-t bg-gradient-to-r from-white to-gray-50">
                <td className="p-2">Total</td>
                <td className="p-2 text-right text-lg">{total.toLocaleString()} DH</td>
                <td className="p-2" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

  // UI state: whether user chose to apply the calculated capital to view a rebalanced Passif
  const [appliedCapital, setAppliedCapital] = useState(false);

  // Derived totals depending on whether capital is applied
  const displayedPassif = appliedCapital ? (data?.adjustedPassif || data?.Passif || []) : (data?.Passif || []);
  const displayedPassTotal = displayedPassif.reduce((s, it) => s + (Number(it.value) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white shadow">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Comptoir — Assistant Comptable (Bilan)</h1>
              <p className="text-sm text-gray-600">Collez une description textuelle et laissez l'IA extraire les postes d'Actif et Passif.</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Status</div>
            {loading ? (
              <div className="mt-1 inline-flex items-center gap-2 text-sm text-blue-600">
                <Spinner size={16} label="Traitement" />
              </div>
            ) : data ? (
              actTotal === passTotal ? (
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-green-700"><CheckCircle /> Bilan équilibré</div>
              ) : (
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-red-700"><AlertTriangle /> Déséquilibre</div>
              )
            ) : (
              <div className="mt-1 text-sm text-gray-400">En attente</div>
            )}
          </div>
        </header>

        <form onSubmit={submit} className="mb-4 bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full p-3 rounded border resize-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Collez la description financière ici..."
            disabled={loading}
          />

          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded inline-flex items-center gap-2" disabled={loading}>
              {loading ? <Spinner size={16} label="Traitement" /> : (<><FileText size={16} />Analyser</>)}
            </button>

            <button
              type="button"
              className="bg-white border px-4 py-2 rounded inline-flex items-center gap-2"
              onClick={() => setText(sample)}
              disabled={loading}
            >
              <RefreshCw size={16} /> Exemple
            </button>

            <button
              type="button"
              className="bg-white border px-4 py-2 rounded inline-flex items-center gap-2"
              onClick={() => { setText(''); setData(null); setError(null); }}
              disabled={loading}
            >
              <Trash2 size={16} /> Réinitialiser
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 text-red-700">Erreur: {error}</div>
        )}

        <section className="mb-6">
          <div className="flex flex-col md:flex-row -mx-4">
            <BalanceTable title="Actif" items={data?.Actif || []} loading={loading} />
            <BalanceTable title="Passif" items={displayedPassif} loading={loading} />
          </div>

          <div className="mt-4 bg-white p-4 rounded shadow flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Actif: <strong>{actTotal.toLocaleString()} DH</strong></div>
              <div className="text-sm text-gray-600">Total Passif: <strong>{displayedPassTotal.toLocaleString()} DH</strong></div>
            </div>

            <div className="text-right">
              {data?.reconciliation?.capitalCalculated && !data?.reconciliation?.balanced && !appliedCapital && (
                <div className="text-red-700 font-semibold mb-2 inline-flex items-center gap-2"><AlertTriangle /> Le bilan n'est pas équilibré</div>
              )}

              {data?.reconciliation?.capitalCalculated && !data?.reconciliation?.balanced && (
                <div className="text-sm text-gray-600">
                  <div>Calcul du <strong>Capital social</strong> : <br />
                    <span className="font-medium">Capital social = Total Actif - Total Passif</span>
                  </div>
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-3">
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded">Total Actif: {data.reconciliation.originalTotalActif.toLocaleString()} DH</div>
                      <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded">Total Passif: {data.reconciliation.originalTotalPassif.toLocaleString()} DH</div>
                      <div className="px-3 py-1 bg-green-50 text-green-700 rounded">Différence: {data.reconciliation.originalDifference.toLocaleString()} DH</div>
                    </div>

                    <div className="mt-3">
                      <div className="inline-flex items-center gap-2">
                        <div className="text-sm">Capital social (calculé) :</div>
                        <div className="font-bold text-lg">{data.reconciliation.capitalValue?.toLocaleString()} DH</div>
                        {data.reconciliation.capitalCalculated && (
                          <span className="ml-3 inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Calculé automatiquement</span>
                        )}
                      </div>

                      <div className="mt-2">
                        {!appliedCapital ? (
                          <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded inline-flex items-center gap-2" onClick={() => setAppliedCapital(true)}>
                            Appliquer le capital calculé
                          </button>
                        ) : (
                          <button className="mt-2 bg-white border px-3 py-1 rounded inline-flex items-center gap-2" onClick={() => setAppliedCapital(false)}>
                            Retirer le capital appliqué
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Balanced message when everything matches */}
              {data?.reconciliation?.balanced && (
                <div className="text-green-700 font-semibold inline-flex items-center gap-2"><CheckCircle /> Le bilan est équilibré</div>
              )}
            </div>
          </div>

          <details className="mt-3 text-sm text-gray-600">
            <summary className="cursor-pointer">Voir JSON retourné</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </section>

        <footer className="text-xs text-gray-500 mt-6">Backend: POST <code>/extract</code> on <code>VITE_API_URL</code> or <code>http://localhost:3000</code></footer>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
            <Spinner size={28} label="Traitement" />
          </div>
        </div>
      )}
    </div>
  );
}
