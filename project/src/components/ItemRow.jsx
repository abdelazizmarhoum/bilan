import { Box, Home, Briefcase, Users, CreditCard, FileText, Archive, Layers } from 'lucide-react';

const ICON_MAP = [
  ['fonds', Briefcase],
  ['savoir', Briefcase],
  ['locaux', Home],
  ['équipements', Home],
  ['stock', Box],
  ['stocks', Box],
  ['créance', Users],
  ['client', Users],
  ['disponibil', CreditCard],
  ['banque', CreditCard],
  ['capital', Layers],
  ['emprunt', CreditCard],
  ['dette', Archive],
  ['résultat', FileText],
];

export default function ItemRow({ item, side = 'Actif' }) {
  const name = (item.name || '').toLowerCase();
  const match = ICON_MAP.find(([k]) => name.includes(k));
  const Icon = match ? match[1] : FileText;

  const isActif = side === 'Actif';

  const iconBg = isActif
    ? 'bg-actif-soft  text-actif  ring-1 ring-actif/20'
    : 'bg-passif-soft text-passif ring-1 ring-passif/20';

  const valueColor = isActif ? 'text-actif' : 'text-passif';
  const accentRow = isActif ? 'accent-row-actif' : 'accent-row-passif';

  const acctBadge = isActif
    ? 'bg-navy-700 text-actif/80  ring-1 ring-actif/20'
    : 'bg-navy-700 text-passif/80 ring-1 ring-passif/20';

  return (
    <tr className={`border-b border-white/[0.04] accent-row ${accentRow} animate-fade-in-up`}>
      {/* Name + icon */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${iconBg}`}>
            <Icon size={15} />
          </span>
          <div>
            <div className="text-sm font-medium text-slate-200 leading-tight">{item.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">N° {item.account_number || '—'}</div>
          </div>
        </div>
      </td>

      {/* Value */}
      <td className={`px-4 py-3 text-right font-semibold text-sm tabular-nums ${valueColor}`}>
        {Number(item.value).toLocaleString('fr-MA')} DH
      </td>

      {/* Account badge (desktop) */}
      <td className="px-4 py-3 text-right hidden md:table-cell">
        <span className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded-md ${acctBadge}`}>
          {item.account_number || '—'}
        </span>
      </td>
    </tr>
  );
}
