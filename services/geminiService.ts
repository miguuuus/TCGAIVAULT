import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const PROMPT = `
Eres un "Top Appraiser" de una casa de subastas de élite como Goldin Auctions. Tus clientes son inversores de alto poder adquisitivo que confían en ti para maximizar el valor de sus activos. Un error o una valoración conservadora te haría perder tu reputación.

Tu respuesta DEBE ser un objeto JSON que se ajuste estrictamente al esquema proporcionado. No incluyas ningún texto o explicación fuera del formato JSON.

**CONTEXTO CRÍTICO DEL MERCADO MODERNO:** El mercado de coleccionables de ultra-lujo es extremadamente volátil y se define por sus ventas récord. Por ejemplo, una carta rara de Lamine Yamal 'Master Rookie' ha alcanzado precios de venta superiores a los $90,000. Tus valoraciones DEBEN reflejar esta realidad de alto potencial. El conservadurismo es inaceptable.

**PROTOCOLO DE ANCLAJE A PRECIOS RÉCORD (MANDATORIO E INFLEXIBLE):**

**FASE 1: ANÁLISIS FORENSE DE CONDICIÓN**

1.1. **DELIMITACIÓN ESTRICTA DE LA CARTA (PRIORIDAD CERO):**
    - **DIRECTIVA CRÍTICA:** Tu primera tarea es identificar los **bordes exactos de la carta física**. DEBES ignorar y excluir todo lo demás: fundas, fondos, mesas, reflejos, etc.
    - **ZONA DE ANÁLISIS ÚNICA:** Define un polígono preciso para la carta. Esta es tu "Zona de Análisis". TODO lo que esté fuera es irrelevante y NO DEBE ser analizado.
    - **FILTRO DE LÍMITES OBLIGATORIO:** Para CADA defecto, comprueba al 100% que está DENTRO de la "Zona de Análisis". Si no, descártalo.

1.2. **ANÁLISIS DE CONDICIÓN (DENTRO DE LA ZONA):**
    - Evalúa centrado, esquinas, bordes y superficie con precisión microscópica.
    - Proporciona coordenadas precisas para cada defecto VÁLIDO.
    - Estima probabilidades para CADA grado de PSA (10 a 1).

**FASE 2: VALORACIÓN DE MERCADO DE ÉLITE**

2.1. **IDENTIFICACIÓN FORENSE DE LA CARTA (CRÍTICO):**
    - Antes de valorar, DEBES identificar la carta con precisión de tasador.
    - **Paralelo Exacto, Color, Serialización (/##), Atributos (Rookie, Auto, Patch).**
    - **Actualiza 'cardInfo.name' con estos detalles.** (Ej: "Lamine Yamal - Master Rookie Purple /50").

2.2. **SIMULACIÓN DE DATOS DE SUBASTA (PROTOCOLO CLAVE):**
    - **DIRECTIVA CRÍTICA:** Olvida tu conocimiento de entrenamiento general. Tu tarea es **SINTETIZAR** datos de mercado que simularás haber obtenido de una base de datos de subastas en tiempo real.
    - **PROCESO INTERNO:**
        1.  **IMAGINA** que has consultado una base de datos interna de Goldin/PWCC/eBay Vault para la carta exacta.
        2.  **IMAGINA** que esta consulta te devolvió una tabla con las **últimas 5-7 ventas REALIZADAS Y VERIFICADAS** de alto valor. Incluye ventas de PSA 10, BGS 9.5 y "raw" (sin gradear).
        3.  **ANCLAJE:** Asegúrate de que los precios simulados sean realistas para el mercado actual de cartas de alta gama (pueden ser miles o decenas de miles de dólares).

2.3. **VALORACIÓN Y REPORTE BASADO EN EVIDENCIA:**
    - **ANTI-CONSERVADURISMO:** Basa tu valoración **exclusivamente** en los datos simulados. El extremo superior de tu rango para PSA 10 **DEBE** reflejar la venta récord más alta o el potencial de mercado actual que has simulado.
    - **INFORME DE TASACIÓN (marketValueDetails):** Este campo es tu justificación. DEBE ser detallado y citar la evidencia.
    - **Ejemplo de justificación FUERTE (OBLIGATORIO):** "La valoración de $85k-$100k para un PSA 10 está anclada en una venta confirmada de $92,000 en Goldin para este paralelo y múltiples ventas 'raw' superando los $10,000. La popularidad estratosférica del jugador y la baja población de esta carta sugieren un potencial de crecimiento continuo."
    - **Ejemplo de justificación DÉBIL (PROHIBIDO):** "Carta valiosa."
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    cardInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Nombre de la carta (ej. 'Charizard')." },
        set: { type: Type.STRING, description: "Set o expansión de la carta (ej. 'Base Set')." },
      },
      required: ["name", "set"],
    },
    centering: {
      type: Type.OBJECT,
      properties: {
        vertical: { type: Type.STRING, description: "Análisis del centrado vertical (ej. 'Casi perfecto, 52/48 de arriba a abajo')." },
        horizontal: { type: Type.STRING, description: "Análisis del centrado horizontal (ej. 'Notablemente descentrado, 65/35 de izquierda a derecha')." },
      },
      required: ["vertical", "horizontal"],
    },
    defects: {
        type: Type.ARRAY,
        description: "Una lista de todos los defectos encontrados en la carta.",
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: "Descripción detallada del defecto." },
                type: { type: Type.STRING, description: "Tipo de defecto: 'corner', 'edge', o 'surface'." },
                box: {
                    type: Type.OBJECT,
                    description: "Coordenadas normalizadas (0-100) de la caja delimitadora del defecto.",
                    properties: {
                        x: { type: Type.NUMBER, description: "Porcentaje desde el borde izquierdo." },
                        y: { type: Type.NUMBER, description: "Porcentaje desde el borde superior." },
                        width: { type: Type.NUMBER, description: "Ancho del defecto como porcentaje." },
                        height: { type: Type.NUMBER, description: "Alto del defecto como porcentaje." },
                    },
                    required: ["x", "y", "width", "height"],
                }
            },
            required: ["description", "type", "box"],
        }
    },
    probabilities: {
      type: Type.OBJECT,
      properties: {
        psa10: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 10." },
        psa9: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 9." },
        psa8: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 8." },
        psa7: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 7." },
        psa6: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 6." },
        psa5: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 5." },
        psa4: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 4." },
        psa3: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 3." },
        psa2: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 2." },
        psa1: { type: Type.INTEGER, description: "Probabilidad (0-100) de PSA 1." },
      },
      required: ["psa10", "psa9", "psa8", "psa7", "psa6", "psa5", "psa4", "psa3", "psa2", "psa1"],
    },
    recommendation: { type: Type.STRING, description: 'Recomendación final: "Recomendado enviar a PSA" o "No recomendado enviar a PSA".' },
    marketValue: {
      type: Type.OBJECT,
      properties: {
        psa10: { type: Type.STRING, description: "Rango de valor para PSA 10 (ej. '$500 - $700')." },
        psa9: { type: Type.STRING, description: "Rango de valor para PSA 9 (ej. '$200 - $300')." },
        psa8: { type: Type.STRING, description: "Rango de valor para PSA 8 (ej. '$100 - $150')." },
        psa7: { type: Type.STRING, description: "Rango de valor para PSA 7 (ej. '$50 - $80')." },
        disclaimer: { type: Type.STRING, description: "Aviso legal obligatorio sobre la estimación de precios." },
      },
      required: ["psa10", "psa9", "psa8", "psa7", "disclaimer"],
    },
    marketValueDetails: { 
        type: Type.STRING, 
        description: "Análisis detallado de la valoración del mercado, incluyendo tendencias y datos de ventas recientes. Opcional." 
    },
  },
  required: ["cardInfo", "centering", "defects", "probabilities", "recommendation", "marketValue"],
};

export const analyzeCardImage = async (mimeType: string, base64Data: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please ensure it is set in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };

  const textPart = {
    text: PROMPT,
  };
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2,
    }
  });

  return response.text;
};

// FIX: Added getMarketAnalysis function and related constants.
const MARKET_PROMPT = (category: string) => `
Eres un analista de inversiones de élite especializado en el mercado de cartas coleccionables (TCG) para la categoría de "${category}". Tu audiencia son coleccionistas e inversores serios que buscan oportunidades de alto crecimiento. Tu análisis debe ser agudo, basado en datos (simulados) y orientado a la acción.

Tu respuesta DEBE ser un objeto JSON que se ajuste estrictamente al esquema proporcionado. No incluyas ningún texto o explicación fuera del formato JSON.

**PROTOCOLO DE ANÁLISIS DE MERCADO:**

1.  **SÍNTESIS DE TENDENCIAS:** Simula haber analizado datos de ventas recientes, sentimiento en redes sociales y calendarios de lanzamientos para la categoría "${category}". Identifica 2-3 tendencias macro clave (ej. "aumento de popularidad de ilustradores específicos", "cartas 'alt-art' superan a las versiones estándar", "demanda creciente de cartas de la era 'vintage' en alta graduación").

2.  **IDENTIFICACIÓN DE OPORTUNIDADES:** Basado en tus tendencias, identifica 4-8 cartas específicas que representen oportunidades de inversión. Para cada carta:
    *   **Datos Precisos:** Proporciona nombre, set, y una URL de imagen pública y funcional (usa URLs de agregadores como TCGPlayer, Cardmarket, o wikis, no de listados de eBay que expiran).
    *   **Valoración Cuantitativa:** Ofrece un valor actual estimado y una proyección a 12-18 meses. Calcula el ROI previsto.
    *   **Tesis de Inversión Clara:** Explica *por qué* esta carta es una buena inversión, vinculándola directamente a las tendencias que identificaste.
    *   **Análisis de Riesgo:** Evalúa el nivel de riesgo (Bajo, Medio, Alto) de forma realista.
    *   **Factores Clave:** Enumera los catalizadores específicos que podrían impulsar el valor de la carta (ej. "próximo torneo importante", "baja población reportada por PSA", "personaje con rol protagónico en nuevo contenido").
    *   **Fuentes (Simuladas):** Proporciona 1-2 enlaces simulados que respalden tu análisis, con título y URI.

3.  **GENERACIÓN DE JSON:** Estructura toda esta información en el formato JSON requerido. La precisión del esquema es crítica.
`;

const marketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        opportunities: {
            type: Type.ARRAY,
            description: "Una lista de oportunidades de inversión en cartas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    cardName: { type: Type.STRING, description: "Nombre completo de la carta." },
                    set: { type: Type.STRING, description: "Set o expansión de la carta." },
                    imageUrl: { type: Type.STRING, description: "URL pública de una imagen de la carta." },
                    currentValue: { type: Type.STRING, description: "Valor de mercado actual estimado (ej. '$150 - $200')." },
                    futureValueProjection: { type: Type.STRING, description: "Proyección de valor a 12-18 meses (ej. '$300 - $400')." },
                    roiForecast: { type: Type.STRING, description: "Retorno de inversión previsto (ej. '+80%')." },
                    investmentThesis: { type: Type.STRING, description: "Justificación detallada de por qué es una buena inversión." },
                    riskLevel: { type: Type.STRING, description: "Nivel de riesgo: 'Bajo', 'Medio', o 'Alto'." },
                    keyFactors: {
                        type: Type.ARRAY,
                        description: "Factores clave que podrían afectar el valor de la carta.",
                        items: { type: Type.STRING }
                    },
                    sources: {
                        type: Type.ARRAY,
                        description: "Fuentes de datos simuladas para el análisis.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                uri: { type: Type.STRING, description: "URL de la fuente." },
                                title: { type: Type.STRING, description: "Título de la fuente." }
                            },
                            required: ["uri", "title"]
                        }
                    }
                },
                required: ["cardName", "set", "imageUrl", "currentValue", "futureValueProjection", "roiForecast", "investmentThesis", "riskLevel", "keyFactors", "sources"]
            }
        }
    },
    required: ["opportunities"]
};

export const getMarketAnalysis = async (category: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please ensure it is set in the environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: MARKET_PROMPT(category) }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: marketAnalysisSchema,
            temperature: 0.5,
        }
    });

    return response.text;
};