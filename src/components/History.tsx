import React, { useState } from 'react';
import type { AnalysisRecord } from '../types';
import { CardStackIcon, DollarIcon, GemIcon, HistoryIcon, TrashIcon, PencilSquareIcon, XMarkIcon } from './icons';

interface CollectionProps {
  records: AnalysisRecord[];
  onSelect: (record: AnalysisRecord) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-[var(--panel-color)]/50 border border-[var(--border-color)] rounded-lg p-4 flex items-center space-x-4">
        <div className="p-3 bg-[var(--border-color)] rounded-md text-[var(--accent-color)]">{icon}</div>
        <div>
            <p className="text-sm text-[var(--text-secondary)]">{title}</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </div>
);

const CollectionDashboard: React.FC<{ records: AnalysisRecord[] }> = ({ records }) => {
    const totalCards = records.length;
    
    const gemPotentialCount = records.filter(r => r.result.probabilities.psa10 >= 80).length;

    const totalValue = records.reduce((acc, record) => {
        const valueStr = record.result.marketValue.psa9; // Using PSA 9 as a conservative baseline
        if (!valueStr || typeof valueStr !== 'string' || !valueStr.includes('$')) {
            return acc;
        }
        const cleanedStr = valueStr.replace(/[$,-]/g, ' ').trim();
        const firstValue = parseFloat(cleanedStr.split(' ')[0]);
        return acc + (isNaN(firstValue) ? 0 : firstValue);
    }, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in">
            <StatCard icon={<CardStackIcon className="w-6 h-6" />} title="Cartas Analizadas" value={totalCards.toString()} />
            <StatCard icon={<DollarIcon className="w-6 h-6" />} title="Valor Estimado (PSA 9)" value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />
            <StatCard icon={<GemIcon className="w-6 h-6" />} title="Potencial Gema (PSA 10)" value={gemPotentialCount.toString()} />
        </div>
    )
};


interface CollectionItemProps {
    record: AnalysisRecord;
    onSelect: () => void;
    isManaging: boolean;
    onDelete: () => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ record, onSelect, isManaging, onDelete }) => {
    return (
        <div 
          onClick={!isManaging ? onSelect : undefined} 
          className={`group relative aspect-[3/4] overflow-hidden rounded-lg transition-all duration-300 border border-[var(--border-color)] ${!isManaging ? 'cursor-pointer hover:border-[var(--accent-color)]' : ''}`}
        >
            <img src={record.imageDataUrl} alt={record.result.cardInfo.name} className={`w-full h-full object-cover transition-transform duration-300 ${!isManaging ? 'group-hover:scale-105' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className={`absolute inset-0 transition-all duration-300 opacity-0 ${!isManaging ? 'group-hover:opacity-100' : ''}`} style={{ boxShadow: `inset 0 0 20px 0 var(--accent-glow)` }}></div>
            <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/50 backdrop-blur-sm">
                 <p className="text-xs font-bold text-white truncate">{record.result.cardInfo.name}</p>
            </div>

            {isManaging && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-7 h-7 flex items-center justify-center bg-red-600/80 rounded-full text-white hover:bg-red-500 transition-colors"
                    aria-label="Eliminar carta"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

const History: React.FC<CollectionProps> = ({ records, onSelect, onClear, onDelete }) => {
  const [isManaging, setIsManaging] = useState(false);
  
  return (
    <div className="w-full">
      <CollectionDashboard records={records} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <HistoryIcon className="w-6 h-6 text-[var(--text-secondary)]" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mi Colección</h2>
        </div>
        {records.length > 0 && (
             <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setIsManaging(!isManaging)} 
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border rounded-md transition-all duration-300
                        ${isManaging 
                            ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-[var(--accent-color)]' 
                            : 'text-[var(--text-secondary)] bg-[var(--panel-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:text-[var(--accent-color)]'
                        }`}
                >
                    <PencilSquareIcon className="w-4 h-4" />
                    <span>{isManaging ? 'Finalizar' : 'Gestionar'}</span>
                </button>

                {!isManaging && (
                    <button 
                        onClick={onClear} 
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Limpiar</span>
                    </button>
                )}
            </div>
        )}
      </div>

      {records.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {records.map((record) => (
              <CollectionItem 
                key={record.id} 
                record={record} 
                onSelect={() => onSelect(record)} 
                isManaging={isManaging}
                onDelete={() => onDelete(record.id)}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--panel-color)] border border-dashed border-[var(--border-color)] rounded-lg">
            <p className="text-lg font-semibold text-[var(--text-primary)]">Tu colección está vacía</p>
            <p className="text-[var(--text-secondary)] mt-2">Las cartas que analices aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
};

export default History;