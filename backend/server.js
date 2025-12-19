import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import express from "express";

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const API_KEY = process.env.GENAI_API_KEY;

if (!API_KEY) {
    console.error("FATAL ERROR: GENAI_API_KEY is not defined in the .env file.");
    process.exit(1); // Exit if the API key is not set
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Middleware ---
// This middleware is crucial for parsing JSON request bodies
app.use(express.static('client'));
app.use(express.json());

// Enable CORS for local development (adjust origin in production)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --- API Route ---
// This route handles POST requests to /extract
app.post('/extract', async (req, res) => {
    // 1. Get the text from the request body
    const { text } = req.body;

    // 2. Validate the input
    if (!text) {
        return res.status(400).json({ error: 'Request body must contain a "text" field.' });
    }

    // 3. Define the prompt (moved outside the try-catch for clarity)
    const prompt = `You are an expert accountant specializing in Moroccan accounting standards. I will provide you with a text describing the financial situation of a company. Your task is to extract all financial items and categorize them into 'Actif' and 'Passif'. For each item, identify its name and its numerical value in Dirhams (DH) as well as its account number in The Moroccan General Chart of Accounts. Please handle variations in language and synonyms. Finally, present the extracted information in a structured format by replaying with ONLY a json object that separates assets and liabilities. Do not add any text or explanations, just the json object.
    If the text does not contain enough information to create a full balance sheet, extract what is possible.
    Crucially, Your entire response must be a single, valid JSON object with the following exact structure and keys. Do not use any other keys. : 
     {
      "Actif": [
        {
          "name": "Item Name",
          "value": 12345,
          "account_number": "XXXX"
        }
      ],
      "Passif": [
        {
          "name": "Item Name",
          "value": 12345,
          "account_number": "XXXX"
        }
      ]
    }
    If your initial thought is to add an explanation, please revise your output to contain only the JSON object.`;
    
    const fullPrompt = prompt + text;

    try {
        // 4. Call the Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        const rawResponse = response.text;

        // 5. Clean and parse the response
        const jsonString = rawResponse
            .replace(/```json\s*([\s\S]*?)\s*```/, "$1")
            .trim();

        let financialData;
        try {
            financialData = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Failed to parse JSON from AI response:", parseError);
            console.error("Raw response:", rawResponse);
            // Send a server error response if parsing fails
            return res.status(500).json({ error: 'Failed to parse AI response as valid JSON.' });
        }

        // --- Server-side accounting rules & reconciliation ---
        // Ensure arrays exist
        const Actif = Array.isArray(financialData.Actif) ? financialData.Actif : [];
        const Passif = Array.isArray(financialData.Passif) ? financialData.Passif : [];

        const sumValues = (arr) => arr.reduce((s, it) => s + (Number(it?.value) || 0), 0);

        // Totals before any adjustment
        const originalTotalActif = sumValues(Actif);
        const originalTotalPassif = sumValues(Passif);
        const originalDifference = originalTotalActif - originalTotalPassif;

        // Detect if a Capital social is already present (case-insensitive match)
        const hasCapital = Passif.some((it) => /capital\s*social|capital/i.test(it?.name || ""));

        let computedCapital = null;
        let balancedAfterApplyingCapital = false;
        let adjustedPassif;

        if (!hasCapital) {
            // Compute capital so that Actif == Passif
            computedCapital = originalDifference;
            adjustedPassif = Passif.concat({ name: 'Capital social (calculé)', value: computedCapital, account_number: '101' });
            balancedAfterApplyingCapital = (originalTotalActif === originalTotalPassif + computedCapital);
        }

        const result = {
            Actif,
            Passif,
            // adjustedPassif is provided so the frontend can optionally display the rebalanced table
            adjustedPassif,
            reconciliation: {
                originalTotalActif,
                originalTotalPassif,
                originalDifference,
                capitalCalculated: computedCapital !== null,
                capitalValue: computedCapital,
                balanced: originalDifference === 0,
                balancedAfterApplyingCapital,
            },
        };

        // 6. Send the successful response back to the client (with reconciliation info)
        res.status(200).json(result);

    } catch (error) {
        console.error("Error during API call to Gemini:", error);
        // Send a server error response if the API call fails
        res.status(500).json({ error: 'Failed to get a response from the AI model.' });
    }
});

// Development helper: mock endpoint for frontend testing without a real API key
app.get('/mock', (req, res) => {
    const sample = {
        Actif: [
            { name: 'Fonds commercial', value: 500000, account_number: '205' },
            { name: 'Locaux et équipements', value: 2000000, account_number: '21' },
            { name: 'Savoir-faire', value: 500000, account_number: '206' },
            { name: 'Stocks', value: 300000, account_number: '31' },
            { name: 'Créances clients', value: 200000, account_number: '41' },
            { name: 'Disponibilités', value: 150000, account_number: '57' }
        ],
        Passif: [
            { name: 'Capital social', value: 1500000, account_number: '101' },
            { name: 'Emprunts bancaires', value: 1200000, account_number: '16' },
            { name: 'Dettes fournisseurs', value: 350000, account_number: '44' },
            { name: 'Dettes fiscales', value: 100000, account_number: '45' },
            { name: 'Résultat', value: 500000, account_number: '12' }
        ]
    };
    res.json(sample);
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});