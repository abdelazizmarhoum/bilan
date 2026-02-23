# Comptoir — Assistant Comptable (Bilan)

Bienvenue dans le projet « Comptoir » : un assistant qui transforme une description textuelle en un Bilan comptable structuré selon les règles de présentation (Actif / Passif), avec des outils d'aide à la réconciliation.

Ce dépôt contient deux parties principales :

- `backend` — serveur Express qui appelle un modèle LLM (Gemini) pour extraire les postes financiers depuis un texte libre et renvoyer un JSON structuré.
- `project` — application frontend Vite + React utilisant Tailwind et lucide-react pour afficher un Bilan interactif et professionnel.

---

## ✅ Fonctionnalités principales

- Backend
  - Appelle Gemini pour extraire `Actif` et `Passif` à partir d'un texte libre (réponse attendue en JSON strict).
  - Parsing robuste et gestion des erreurs liées aux réponses IA.
  - Règles de réconciliation : si `Capital social` est absent, le serveur calcule la valeur manquante (sans modifier silencieusement l'original `Passif`) et renvoie :
    - `reconciliation` (totaux originaux, différence, capital calculé, statuts),
    - `adjustedPassif` (Passif avec le capital calculé ajouté, pour affichage optionnel).
  - `GET /mock` pour développement local sans clé API.

- Frontend
  - UI moderne et colorée basée sur Tailwind + lucide-react.
  - Composants réutilisables : `Spinner`, `ItemRow`, `Confetti`.
  - Chargement animé (squelettes) et overlay pendant l'analyse.
  - Présentation groupée par classes comptables : par exemple "Actif Immobilisé", "Actif Circulant" pour l'Actif ; "Capitaux Propres", "Dettes Circulantes" pour le Passif, avec sous-totaux par classe.
  - UI de réconciliation claire : affichage de l'écart, calcul du `Capital social`, et bouton pour « Appliquer le capital calculé » (toggle) — l'utilisateur contrôle l'application du correctif.
  - Animation de célébration (confetti) lorsque le bilan devient équilibré.

---

## 🚀 Installation et démarrage

### 1) Backend

1. Copier ou créer `backend/.env` et définir la clé Gemini :

```env
GENAI_API_KEY=sk-...
PORT=3000
```

2. Installer et lancer le serveur :

```bash
cd backend
npm install
node server.js
```

Si vous n'avez pas de clé API, vous pouvez utiliser l'endpoint de mock pour le développement (`GET /mock`).

### 2) Frontend

1. Configurer `project/.env` (valeurs par défaut) :

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true   # mettre à false pour appeler l'endpoint /extract réel
```

2. Installer et lancer le front :

```bash
cd project
npm install
npm run dev
```

3. Ouvrir l'URL fournie par Vite (généralement http://localhost:5173).

---

## 📡 API exposées

- POST `/extract`
  - Corps de la requête : `{ "text": "...description libre..." }`
  - Réponse (succès) : JSON structuré, exemple :

```json
{
  "Actif": [ { "name": "Fonds commercial", "value": 500000, "account_number": "205" } ],
  "Passif": [ { "name": "Capital social", "value": 1500000, "account_number": "101" } ],
  "adjustedPassif": [ /* Passif + capital calculé (optionnel) */ ],
  "reconciliation": {
    "originalTotalActif": 3650000,
    "originalTotalPassif": 3500000,
    "originalDifference": 150000,
    "capitalCalculated": true,
    "capitalValue": 150000,
    "balanced": false,
    "balancedAfterApplyingCapital": true
  }
}
```

- GET `/mock` — retourne un exemple statique utile en développement.

---

## 🧾 Gestion du `Capital social`

Si le modèle IA ne fournit pas de poste `Capital social` dans le `Passif` et que les totaux sont inégaux, le serveur calcule :

```
Capital social = Total Actif - Total Passif
```

Le serveur n'altère pas le `Passif` original de façon silencieuse ; il renvoie :

- `reconciliation.capitalCalculated` (booléen) — indique qu'un capital a été calculé,
- `reconciliation.capitalValue` — la valeur calculée,
- `adjustedPassif` — le tableau `Passif` avec le capital ajouté (pour affichage optionnel si l'utilisateur choisit d'appliquer le correctif).

Dans l'interface, l'utilisateur voit d'abord l'écart et la formule. Il peut ensuite appliquer le capital calculé pour afficher un tableau rebalancé ; une animation confetti apparaît brièvement si le bilan devient équilibré.

---

## 🧾 Présentation groupée par classes comptables

Le frontend regroupe maintenant les postes en classes (exemples) :

- Actif Immobilisé (comptes commençant par `2`, mots-clés : fonds, matériel, logiciel, mobilier),
- Actif Circulant (comptes `3`, `4`, `5`, mots-clés : stock, créances, banque, caisse),
- Capitaux Propres (comptes `1`, mots-clés : capital, résultat, réserve),
- Dettes Financières (comptes `16/17`, mots-clés : emprunt),
- Dettes Circulantes (comptes `4x`, mots-clés : fournisseurs, salaires, fiscalité).

La classification est effectuée par `project/src/utils/classify.js` via des heuristiques sur `account_number` et des mots-clés. Elle fournit des sous-totaux par classe et le total général.

Remarque : ces règles sont heuristiques et peuvent être affinées selon votre Plan Comptable Général ou préférences locales.

---

## 🛠 Notes de développement et améliorations possibles

- Robustesse parsing IA : le modèle peut parfois renvoyer des explications ou un format inattendu — nous nettoyons les fences de code et tentons de parser le JSON, mais des validations supplémentaires sont utiles.
- Améliorations possibles :
  - panneau de réglage pour personnaliser les mappings comptes→classes,
  - règles serveur pour normaliser et fusionner des postes (ex. fonds commercial + savoir-faire),
  - tests unitaires pour le parsing et la réconciliation,
  - export/print (PDF / Excel) pour le Bilan finalisé,
  - améliorations d'accessibilité (labels ARIA, navigation clavier) — en cours.

---

## 🧪 Exemple de test

Collez le texte d'exemple suivant dans l'UI ou envoyez-le à `POST /extract` pour vérifier le calcul automatique du capital :

> Ali détient une entreprise de prestations de services informatiques. Il est propriétaire des éléments suivants :
>
> Divers logiciels évalués à 200 000 DH.
>
> Un local évalué à 500 000 DH.
>
> Un véhicule évalué à 300 000 DH.
>
> Divers ordinateurs et imprimantes, évalués à 200 000 DH.
>
> Du mobilier et des aménagements divers évalués à 300 000 DH.
>
> Il dispose également d’un stock de fournitures personnelles d’une valeur de 50 000 DH.
> Ses clients lui doivent 450 000 DH.
> Il a un dépôt en banque de 300 000 DH.
> Il détient des espèces en caisse pour un montant de 200 000 DH.
>
> Son capital est à déterminer.
> Le compte de réserve présente un solde créditeur de 300 000 DH.
> Il a des emprunts bancaires d’une valeur de 1 200 000 DH.
> Ali a une dette envers ses fournisseurs d’une valeur de 300 000 DH.
> Les salaires à payer s’élèvent à 200 000 DH.
> Les cotisations dues à la Sécurité sociale sont de 40 000 DH.
> Les taxes dues à l’État sont de 60 000 DH.

Le backend calculera le `Capital social` manquant et la UI proposera d'appliquer ce montant pour rebalancer le bilan.

---

## Dépannage

- Si le frontend affiche une erreur de parsing : vérifiez les logs du backend — le modèle a peut-être renvoyé du texte non-JSON. Utilisez `GET /mock` pour tester localement sans clé.
- Vérifiez `VITE_USE_MOCK` dans `project/.env` si le frontend est bloqué et vous n'avez pas de clé API.
