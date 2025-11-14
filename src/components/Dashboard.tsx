import React, { useMemo } from 'react';
import type { AnalysisRecord } from '../types';
import { CardStackIcon, DollarIcon, GemIcon } from './icons';
import PortfolioValueChart from './PortfolioValueChart';

interface DashboardProps {
  collection: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
}

const parseMarketValue = (valueStr: string | undefined): number => {
    if (!valueStr || typeof valueStr !== 'string') {
        return 0;
    }
    // Take the first part of a range (e.g., "$15,000 - $20,000")
    let targetStr = valueStr.split('-')[0].trim();
    // Handle 'k' for thousands
    const isK = targetStr.toLowerCase().includes('k');
    if (isK) {
        targetStr = targetStr.toLowerCase().replace('k', '');
    }
    // Remove all non-numeric characters except the decimal point
    const cleanedStr = targetStr.replace(/[^0-9.]/g, '');
    let value = parseFloat(cleanedStr);
    if (isNaN(value)) {
        return 0;
    }
    // Apply multiplier if 'k' was present
    if (isK) {
        value *= 1000;
    }
    return value;
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-4 flex items-center space-x-4 backdrop-blur-sm">
        <div className="p-3 bg-[var(--border-color)] rounded-md text-[var(--accent-color)]">{icon}</div>
        <div>
            <p className="text-sm text-[var(--text-secondary)]">{title}</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </div>
);

const CollectionDashboard: React.FC<{ records: AnalysisRecord[] }> = ({ records }) => {
    const totalCards = records.length;
    
    const gemPotentialCards = records.filter(r => {
        const bestGrade = Object.entries(r.result.probabilities).reduce((a, b) => a[1] > b[1] ? a : b);
        return bestGrade[0] === 'psa10' && bestGrade[1] >= 50;
    });

    const gemPotentialValue = gemPotentialCards.reduce((acc, record) => {
        return acc + parseMarketValue(record.result.marketValue.psa10);
    }, 0);

    const totalValue = records.reduce((acc, record) => {
        return acc + parseMarketValue(record.result.marketValue.psa9);
    }, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={<CardStackIcon className="w-6 h-6" />} title="Cartas en la Bóveda" value={totalCards.toString()} />
            <StatCard icon={<DollarIcon className="w-6 h-6" />} title="Valor Base Colección (Est. PSA 9)" value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />
            <StatCard 
                icon={<GemIcon className="w-6 h-6" />} 
                title={`Potencial Máximo Gema (${gemPotentialCards.length})`} 
                value={`$${gemPotentialValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            />
        </div>
    )
};

const RecentActivityItem: React.FC<{ record: AnalysisRecord, onSelect: () => void }> = ({ record, onSelect }) => (
    <button onClick={onSelect} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200 w-full text-left">
        <img src={record.imageDataUrl} alt={record.result.cardInfo.name} className="w-12 h-16 object-cover rounded-md border border-[var(--border-color)]" />
        <div className="flex-1">
            <p className="font-semibold text-white truncate">{record.result.cardInfo.name}</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">{record.result.cardInfo.set}</p>
        </div>
        <div className="text-right">
             <p className="text-xs text-[var(--text-secondary)]">Pot. Gema</p>
             <p className="font-bold text-lg text-[var(--accent-color)]">{record.result.probabilities.psa10}%</p>
        </div>
    </button>
);

const ChartContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-md font-bold mb-4 text-center text-slate-300 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const GradeDistributionChart: React.FC<{ collection: AnalysisRecord[] }> = ({ collection }) => {
    const gradeData = useMemo(() => {
        const gradeCounts: { [grade: string]: number } = { 'PSA 10': 0, 'PSA 9': 0, 'PSA 8': 0, 'PSA 7': 0, 'Otro': 0 };
        collection.forEach(record => {
            const bestGradeEntry = Object.entries(record.result.probabilities).reduce((a, b) => a[1] > b[1] ? a : b);
            const gradeNum = parseInt(bestGradeEntry[0].replace('psa', ''), 10);
            if (gradeNum >= 10) gradeCounts['PSA 10']++;
            else if (gradeNum === 9) gradeCounts['PSA 9']++;
            else if (gradeNum === 8) gradeCounts['PSA 8']++;
            else if (gradeNum === 7) gradeCounts['PSA 7']++;
            else gradeCounts['Otro']++;
        });
        const total = collection.length || 1;
        return Object.entries(gradeCounts).map(([name, count]) => ({ name, count, percent: (count / total) * 100 }));
    }, [collection]);
    
    return (
        <div className="space-y-2">
            {gradeData.map(item => (
                <div key={item.name} className="flex items-center text-xs">
                    <span className="w-12 text-slate-400">{item.name}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-4 mr-2">
                        <div className="bg-cyan-500 h-4 rounded-full text-right pr-1.5 text-black font-bold" style={{ width: `${item.percent}%`}}>
                           {item.count > 0 && <span className="text-white mix-blend-difference">{item.count}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SetDistributionChart: React.FC<{ collection: AnalysisRecord[] }> = ({ collection }) => {
     const setData = useMemo(() => {
        const setCounts: { [set: string]: number } = {};
        collection.forEach(record => {
            const setName = record.result.cardInfo.set || 'Desconocido';
            setCounts[setName] = (setCounts[setName] || 0) + 1;
        });
        const total = collection.length || 1;
        return Object.entries(setCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count, percent: (count / total) * 100 }));
    }, [collection]);

    return (
        <div className="space-y-2">
            {setData.map(item => (
                <div key={item.name} className="flex items-center text-xs">
                    <span className="w-24 text-slate-400 truncate" title={item.name}>{item.name}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-4 mr-2">
                         <div className="bg-cyan-500 h-4 rounded-full text-right pr-1.5 text-black font-bold" style={{ width: `${item.percent}%`}}>
                            <span className="text-white mix-blend-difference">{item.count}</span>
                         </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ collection, onSelectRecord }) => {
    const recentRecords = collection.slice(0, 5);
    
    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <CollectionDashboard records={collection} />

            {collection.length > 1 && (
                <ChartContainer title="Valor Histórico del Portafolio (PSA 9 Est.)">
                    <PortfolioValueChart collection={collection} />
                </ChartContainer>
            )}

            {collection.length > 0 && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartContainer title="Distribución por Grado">
                        <GradeDistributionChart collection={collection} />
                    </ChartContainer>
                     <ChartContainer title="Top Sets en Colección">
                        <SetDistributionChart collection={collection} />
                    </ChartContainer>
                 </div>
            )}
            
            <div>
                <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-4 backdrop-blur-sm">
                    {recentRecords.length > 0 ? (
                        <div className="divide-y divide-[var(--border-color)]">
                            {recentRecords.map(record => (
                                <RecentActivityItem key={record.id} record={record} onSelect={() => onSelectRecord(record)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-[var(--text-secondary)] py-8">No hay actividad reciente. ¡Analiza tu primera carta para empezar!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;