import { GoogleGenAI, Type } from "@google/genai";
import { Patient, SimulationParams, AIAnalysisResult } from '../types';

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePatientRisk = async (patient: Patient): Promise<AIAnalysisResult> => {
  const ai = getAiClient();
  if (!ai) {
    return {
      riskScore: 0,
      summary: "API Key missing. Unable to generate analysis.",
      recommendations: ["Check configuration."]
    };
  }

  const prompt = `
    Analyze the cardiovascular risk for the following patient:
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    Medical History: ${patient.history.join(', ')}
    Vitals:
    - Systolic BP: ${patient.vitals.systolicBP}
    - Diastolic BP: ${patient.vitals.diastolicBP}
    - Cholesterol: ${patient.vitals.cholesterol}
    - Blood Sugar: ${patient.vitals.bloodSugar}
    - Weight: ${patient.vitals.weight}kg
    - SpO2: ${patient.vitals.spO2}%
    
    Provide a JSON response with:
    1. A calculated risk score (0-100, where 100 is high risk).
    2. A brief 1-2 sentence clinical summary.
    3. A list of 3 specific, actionable recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return {
      riskScore: patient.riskScore, // Fallback to existing
      summary: "AI service temporarily unavailable. Showing cached data.",
      recommendations: ["Consult cardiologist manually."]
    };
  }
};

export const simulateLifestyleChange = async (patient: Patient, params: SimulationParams): Promise<AIAnalysisResult> => {
  const ai = getAiClient();
  if (!ai) return { riskScore: 0, summary: "Error", recommendations: [] };

  const prompt = `
    Act as a cardiovascular simulation engine. 
    Current Patient State:
    - Age: ${patient.age}
    - BP: ${patient.vitals.systolicBP}/${patient.vitals.diastolicBP}
    - Weight: ${patient.vitals.weight}kg
    
    Proposed Lifestyle Changes:
    - Weight Change: ${params.weightChange}kg
    - Weekly Exercise: ${params.exerciseMinutes} minutes
    - Quit Smoking: ${params.quitSmoking ? 'Yes' : 'No/Already Non-smoker'}
    - Medication Adherence: ${params.medicationAdherence}%

    Predict the new risk score and describe the physiological impact.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "The new predicted risk score" },
            simulationOutcome: { type: Type.STRING, description: "Description of the health outcome based on changes" },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
     console.error("Simulation Failed:", error);
     return {
       riskScore: 0,
       summary: "Simulation failed.",
       recommendations: [],
       simulationOutcome: "Could not process simulation."
     };
  }
};
