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

  const colorBg = side === 'Actif' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600';
  const valueColor = side === 'Actif' ? 'text-indigo-700' : 'text-amber-700';

  return (
    <tr className="border-t hover:bg-gray-50 transition-colors">
      <td className="p-2 flex items-center gap-3">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm ${colorBg}`}>
          <Icon size={16} />
        </span>
        <div>
          <div className="font-medium text-sm">{item.name}</div>
          <div className="text-xs text-gray-400">{item.account_number || '—'}</div>
        </div>
      </td>
      <td className={`p-2 text-right ${valueColor} font-medium`}>{Number(item.value).toLocaleString()} DH</td>
      <td className="p-2 text-right text-sm text-gray-500 hidden md:table-cell">{item.account_number || '—'}</td>
    </tr>
  );
}
