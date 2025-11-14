import React from 'react';
import type { MarketOpportunityCard } from '../types';
import { XMarkIcon, DiamondIcon, ShieldCheckIcon, LightBulbIcon, ArrowTrendingUpIcon, LinkIcon } from './icons';

interface MarketDetailModalProps {
  opportunity: MarketOpportunityCard;
  onClose: () => void;
}

const MarketDetailModal: React.FC<MarketDetailModalProps> = ({ opportunity, onClose }) => {

    const riskColor = {
        'Bajo': 'text-green-400',
        'Medio': 'text-yellow-400',
        'Alto': 'text-red-400',
    };

    return (
        <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-xl shadow-2xl shadow-black/50 w-full max-w-4xl m-4 animate-slide-up h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white truncate">{opportunity.cardName}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-white/10 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Image & Financial Data */}
                        <div className="space-y-6">
                            <img 
                                src={opportunity.imageUrl} 
                                alt={opportunity.cardName} 
                                className="w-full max-w-sm mx-auto rounded-lg border-2 border-slate-700"
                                onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300x420.png?text=No+Image'}
                            />
                            
                            <InfoSection icon={<ArrowTrendingUpIcon className="w-6 h-6 text-cyan-400" />} title="Datos Financieros">
                                <FinancialDataRow label="Valor Actual" value={opportunity.currentValue} />
                                <FinancialDataRow label="Proyección Futura" value={opportunity.futureValueProjection} />
                                <FinancialDataRow label="Previsión ROI" value={opportunity.roiForecast} valueClass="text-green-400 font-bold" />
                            </InfoSection>

                        </div>

                        {/* Right Column: Investment Analysis */}
                        <div className="space-y-6">
                             <InfoSection icon={<LightBulbIcon className="w-6 h-6 text-yellow-400" />} title="Tesis de Inversión">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {opportunity.investmentThesis}
                                </p>
                             </InfoSection>

                             <InfoSection icon={<ShieldCheckIcon className="w-6 h-6 text-blue-400" />} title="Análisis de Riesgo">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-lg">Nivel de Riesgo:</span>
                                    <span className={`font-bold text-lg ${riskColor[opportunity.riskLevel]}`}>
                                        {opportunity.riskLevel}
                                    </span>
                                </div>
                             </InfoSection>

                             <InfoSection icon={<DiamondIcon className="w-5 h-5 text-purple-400" />} title="Factores Clave">
                                <ul className="space-y-2">
                                    {opportunity.keyFactors.map((factor, index) => (
                                        <li key={index} className="flex items-start space-x-3 text-sm text-slate-300">
                                            <span className="text-cyan-400 mt-1">&#x25B8;</span>
                                            <span>{factor}</span>
                                        </li>
                                    ))}
                                </ul>
                            </InfoSection>

                            <InfoSection icon={<LinkIcon className="w-6 h-6 text-slate-400" />} title="Fuentes de Datos">
                                {opportunity.sources && opportunity.sources.length > 0 ? (
                                    <ul className="space-y-2">
                                        {opportunity.sources.map((source, index) => (
                                            <li key={index}>
                                                <a 
                                                    href={source.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline truncate block"
                                                    title={source.uri}
                                                >
                                                    {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400">No se proporcionaron fuentes de datos para este análisis.</p>
                                )}
                            </InfoSection>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            {icon}
            <span className="ml-3">{title}</span>
        </h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const FinancialDataRow: React.FC<{ label: string; value: string; valueClass?: string }> = ({ label, value, valueClass = 'text-white' }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">{label}:</span>
        <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
);

export default MarketDetailModal;