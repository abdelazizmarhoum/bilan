# Comptoir — Assistant Comptable (Bilan) ⚖️

This repository contains two main folders:

- `backend` — Express server that sends a carefully crafted prompt to a Large Language Model (Gemini) and returns structured financial data.
- `project` — Vite + React frontend (Tailwind, lucide-react) that posts narrative text to the backend and displays a polished Balance Sheet (Bilan).

---

## ✅ Features implemented

- Backend
  - Calls Gemini to extract `Actif` and `Passif` from natural language input (returns a strict JSON structure).
  - Robust parsing and error handling for AI responses.
  - Reconciliation logic: computes **Capital social** when it is missing (but does not silently mutate the original `Passif`). It returns `reconciliation` details and an `adjustedPassif` array containing the calculated capital for optional display.
  - A development `GET /mock` endpoint to return a sample response for frontend testing without an API key.

- Frontend
  - Clean, colorful UI built with Tailwind + lucide-react icons.
  - Reusable `Spinner` and `ItemRow` components for better visuals.
  - Loading skeleton rows and an overlay while processing.
  - Clear imbalance UI: shows when "Le bilan n'est pas équilibré", displays the calculation for `Capital social`, and provides a button to "Appliquer le capital calculé" (toggle) to view a rebalanced table.
  - Grouped presentation: the Bilan is now split into accounting classes (e.g., "Actif Immobilisé", "Actif Circulant" on the Actif side; "Capitaux Propres", "Dettes Circulantes" on the Passif side) with subtotals per class.
    - Celebratory confetti animation when the balance becomes equal (visually confirms success).

---

## 🚀 Quick start

### 1) Backend

1. Create a `.env` in `backend/` or set `GENAI_API_KEY` in your environment:

```env
GENAI_API_KEY=sk-...
PORT=3000
```

2. Install dependencies and run:

```bash
cd backend
npm install
node server.js
```

If you do not have a Gemini API key yet, use the mock endpoint (see below) for frontend work.

### 2) Frontend

1. Configure `project/.env` (defaults shown):

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true   # set to false to call the real /extract endpoint
```

2. Install and run the dev server:

```bash
cd project
npm install
npm run dev
```

3. Open the Vite URL (typically http://localhost:5173).

---

## 📡 API Endpoints

- POST /extract
  - Request body: { text: string }
  - Response (success):

```json
{
  "Actif": [ { "name": "...", "value": 123, "account_number": "..." } ],
  "Passif": [ { "name": "...", "value": 456, "account_number": "..." } ],
  "adjustedPassif": [ /* Passif + computed Capital social (optional) */ ],
  "reconciliation": {
    "originalTotalActif": 123,
    "originalTotalPassif": 100,
    "originalDifference": 23,
    "capitalCalculated": true,
    "capitalValue": 23,
    "balanced": false,
    "balancedAfterApplyingCapital": true
  }
}
```

- GET /mock
  - Returns a sample `Actif`/`Passif` response for development without AI credentials.

---

## 🧾 How Capital Social is handled

When the AI output does not include a `Capital social` item in `Passif` and the totals are unequal, the server computes:

```
Capital social = Total Actif - Total Passif
```

The server does NOT mutate the original `Passif` array silently. Instead the response contains:

- `reconciliation.capitalCalculated` (boolean) — indicates the capital was computed
- `reconciliation.capitalValue` — the numeric value computed
- `adjustedPassif` — the `Passif` array with the computed capital appended (for display if you choose to apply it)

On the frontend you will therefore see a clear message that the balance is not equal, the calculation used, and a toggle button to apply or remove the computed capital — giving users control and transparency.

Additionally, when the user applies the computed capital and the totals match, the UI briefly displays a confetti animation to celebrate the balanced state.

---

## 🧪 Testing scenarios (example)

Use this sample narrative in the frontend (or send it directly to POST /extract):

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

The backend will compute `Capital social = Total Actif - Total Passif` and return the reconciliation details for the frontend to display and optionally apply.

---

## 🛠 Development notes & next steps

- The AI model is asked to return a strict JSON with `Actif` and `Passif`. However, model outputs can be noisy — we already strip code fences and parse JSON carefully. Consider adding:
  - Stronger validation rules for expected account numbers and amounts.
  - Unit tests for parsing, reconciliation rules, and UI behaviors.
  - Export/print functionality (PDF / Excel) for finalized balance sheets.
  - Accessibility improvements (ARIA labels, keyboard navigation) and internationalization (FR / EN UI strings).

---

## ❓ Troubleshooting

- If the frontend shows a parsing error, check backend logs — the AI may have returned non-JSON text. Use `GET /mock` for local testing.
- Verify `VITE_USE_MOCK` if the frontend is not showing results and you don't have an API key.

