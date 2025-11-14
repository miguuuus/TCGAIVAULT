import React, { useState, useEffect } from 'react';
import { getMarketAnalysis } from '../services/geminiService';
import type { MarketAnalysis, MarketOpportunityCard } from '../types';
import { SparklesIcon } from './icons';

interface MarketplacePageProps {
    isProUser: boolean;
    onOpenUpgradeModal: () => void;
    onSelectOpportunity: (opportunity: MarketOpportunityCard) => void;
}

const TCG_CATEGORIES = ['General', 'Pokémon', 'Deportes', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Lorcana', 'One Piece'];

const cleanAndParseJson = <T,>(jsonString: string): T => {
    // Tries to find the JSON block in a markdown string
    const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    const strToParse = match ? match[1] : jsonString;
    try {
        return JSON.parse(strToParse) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", strToParse);
        // Fallback to parsing the original string if the regex fails but it might be valid JSON
        try {
            return JSON.parse(jsonString) as T;
        } catch (e2) {
             console.error("Failed to parse original JSON string:", jsonString);
             throw new Error("Invalid JSON response from AI.");
        }
    }
};

const MarketplacePage: React.FC<MarketplacePageProps> = ({ isProUser, onOpenUpgradeModal, onSelectOpportunity }) => {
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(TCG_CATEGORIES[0]);

    useEffect(() => {
        if (!isProUser) {
            onOpenUpgradeModal();
        }
    }, [isProUser, onOpenUpgradeModal]);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const jsonResponse = await getMarketAnalysis(selectedCategory);
            const result = cleanAndParseJson<MarketAnalysis>(jsonResponse);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setError('Hubo un error al generar el informe de mercado. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isProUser) {
        return null;
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center justify-center md:justify-start">
                    <SparklesIcon className="w-7 h-7 mr-3 text-amber-400" />
                    Radar de Mercado (PRO)
                </h1>
                <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2">
                    La IA escanea el mercado para encontrar las últimas tendencias y oportunidades de inversión.
                </p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-6 p-4 bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg backdrop-blur-sm">
                 <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-slate-400 mb-2 text-center">
                        Selecciona una categoría para analizar:
                    </label>
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full max-w-xs mx-auto block bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    >
                        {TCG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_20px_var(--accent-glow)] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analizando Mercado...' : 'Generar Informe'}
                </button>
            </div>
            
            {isLoading && (
                 <div className="flex justify-center items-center py-20">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                         <div className="absolute h-12 w-12 animate-spin-slow border-2 border-[var(--accent-color)] rounded-sm"></div>
                         <div className="absolute h-8 w-8 bg-[var(--accent-color)] opacity-75 animate-pulse rounded-sm"></div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="text-center py-12 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-lg font-semibold text-red-300">{error}</p>
                </div>
            )}

            {analysis && analysis.opportunities.length > 0 && (
                <div className="space-y-10 animate-fade-in">
                    <MarketSection title="📈 Análisis de Mercado" opportunities={analysis.opportunities} onSelect={onSelectOpportunity} />
                </div>
            )}
            
            {!analysis && !isLoading && !error && (
                 <div className="text-center py-20 bg-[var(--panel-color)] border border-dashed border-[var(--border-color)] rounded-lg">
                    <p className="text-lg font-semibold">Tu informe de mercado aparecerá aquí</p>
                    <p className="text-[var(--text-secondary)] mt-2">Selecciona una categoría y haz clic en "Generar Informe".</p>
                </div>
            )}
        </div>
    );
};

const MarketSection: React.FC<{ title: string, opportunities: MarketOpportunityCard[], onSelect: (opportunity: MarketOpportunityCard) => void }> = ({ title, opportunities, onSelect }) => (
    <div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 border-b-2 border-[var(--border-color)] pb-3">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {opportunities.map((item, index) => (
                <MarketCardItem key={index} opportunity={item} onSelect={() => onSelect(item)} />
            ))}
        </div>
    </div>
);

const MarketCardItem: React.FC<{ opportunity: MarketOpportunityCard, onSelect: () => void }> = ({ opportunity, onSelect }) => (
    <div
      onClick={onSelect}
      className="group relative aspect-[3/4] overflow-hidden rounded-lg transition-all duration-300 border-2 border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)] hover:scale-105"
    >
      <img src={opportunity.imageUrl} alt={opportunity.cardName} className="w-full h-full object-cover transition-transform duration-300" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300x420.png?text=No+Image'} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
      <div className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 20px 0 var(--accent-glow)` }}></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <p className="font-bold text-sm truncate">{opportunity.cardName}</p>
        <p className="text-xs text-slate-400 truncate">{opportunity.set}</p>
        <div className="mt-2 text-center bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-xs font-bold px-2 py-0.5 rounded-full">
            ROI: {opportunity.roiForecast}
        </div>
      </div>
    </div>
);


export default MarketplacePage;