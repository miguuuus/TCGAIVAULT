export interface Defect {
  description: string;
  type: 'corner' | 'edge' | 'surface' | 'centering';
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalysisResult {
  cardInfo: {
    name: string;
    set: string;
  };
  centering: {
    vertical: string;
    horizontal: string;
  };
  defects: Defect[];
  probabilities: {
    psa10: number;
    psa9: number;
    psa8: number;
    psa7: number;
    psa6: number;
    psa5: number;
    psa4: number;
    psa3: number;
    psa2: number;
    psa1: number;
  };
  recommendation: string;
  marketValue: {
    psa10: string;
    psa9: string;
    psa8: string;
    psa7: string;
    disclaimer: string;
  };
  marketValueDetails?: string;
}

export interface AnalysisRecord {
    id: string;
    date: string;
    imageDataUrl: string;
    result: AnalysisResult;
}

// FIX: Added missing type definitions for MarketAnalysis and MarketOpportunityCard.
export interface MarketOpportunityCard {
  cardName: string;
  set: string;
  imageUrl: string;
  currentValue: string;
  futureValueProjection: string;
  roiForecast: string;
  investmentThesis: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  keyFactors: string[];
  sources: {
    uri: string;
    title: string;
  }[];
}

export interface MarketAnalysis {
  opportunities: MarketOpportunityCard[];
}

export const MAX_FREE_COLLECTION_ITEMS = 50;