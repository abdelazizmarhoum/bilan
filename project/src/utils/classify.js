// Simple classification rules based on Moroccan account number prefixes and keywords
export function classifyItems(items = [], side = 'Actif') {
  const groups = {};

  function addToGroup(key, title, item) {
    if (!groups[key]) groups[key] = { title, items: [], total: 0 };
    groups[key].items.push(item);
    groups[key].total += Number(item.value) || 0;
  }

  for (const item of items) {
    const acc = (item.account_number || '').toString();
    const name = (item.name || '').toLowerCase();

    if (side === 'Actif') {
      // Actif Immobilisé: accounts starting with 2
      if (acc.startsWith('2') || /fonds|matériel|équip|logiciel|licen|mobilier|immobil/i.test(name)) {
        addToGroup('immobilise', 'Actif Immobilisé', item);
        continue;
      }

      // Actif Circulant: stocks(3), créances(4), disponibilités(5)
      if (acc.startsWith('3') || acc.startsWith('4') || acc.startsWith('5') || /stock|créanc|client|banque|cais/i.test(name)) {
        addToGroup('circulant', 'Actif Circulant', item);
        continue;
      }

      // fallback
      addToGroup('other_actif', 'Autres Actifs', item);
    } else {
      // Passif
      // Capitaux propres: 1
      if (acc.startsWith('1') || /capital|résultat|réserv/i.test(name)) {
        addToGroup('capitaux', 'Capitaux Propres', item);
        continue;
      }

      // Dettes financières: 16,17
      if (acc.startsWith('16') || acc.startsWith('17') || /emprunt|obligat|dettes fi/i.test(name)) {
        addToGroup('dettes_fin', 'Dettes Financières', item);
        continue;
      }

      // Dettes circulantes: suppliers, taxes, social, accounts starting with 4
      if (acc.startsWith('4') || /fournisseur|fisc|taxe|salair|cotis|social|dettes/i.test(name)) {
        addToGroup('dettes_circ', 'Dettes Circulantes', item);
        continue;
      }

      addToGroup('other_passif', 'Autres Passifs', item);
    }
  }

  // Order groups meaningfully
  const order = side === 'Actif'
    ? ['immobilise', 'circulant', 'other_actif']
    : ['capitaux', 'dettes_fin', 'dettes_circ', 'other_passif'];

  return order.map((k) => groups[k]).filter(Boolean);
}
