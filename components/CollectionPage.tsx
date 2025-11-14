import React, { useState, useMemo } from 'react';
import type { AnalysisRecord } from '../types';
import { XMarkIcon, LayoutGridIcon, ListBulletIcon, MagnifyingGlassIcon, ScaleIcon, CheckCircleIcon, PencilSquareIcon, TrashIcon } from './icons';

type ViewMode = 'grid' | 'list';
type SortOrder = 'date_desc' | 'date_asc' | 'value_desc' | 'value_asc';

interface CollectionPageProps {
  collection: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onStartCompare: (record1: AnalysisRecord, record2: AnalysisRecord) => void;
}

interface GridViewProps {
  collection: AnalysisRecord[];
  onSelect: (record: AnalysisRecord) => void;
  isCompareMode: boolean;
  selectedForCompare: string[];
  onToggleCompare: (record: AnalysisRecord) => void;
  isManaging: boolean;
  onDelete: (id: string) => void;
}

interface ListViewProps {
  collection: AnalysisRecord[];
  onSelect: (record: AnalysisRecord) => void;
  onDelete: (id: string) => void;
}

const parseMarketValue = (valueStr: string | undefined): number => {
    if (!valueStr || typeof valueStr !== 'string') {
        return 0;
    }
    let targetStr = valueStr.split('-')[0].trim();
    const isK = targetStr.toLowerCase().includes('k');
    if (isK) {
        targetStr = targetStr.toLowerCase().replace('k', '');
    }
    const cleanedStr = targetStr.replace(/[^0-9.]/g, '');
    let value = parseFloat(cleanedStr);
    if (isNaN(value)) {
        return 0;
    }
    if (isK) {
        value *= 1000;
    }
    return value;
};

const CollectionPage: React.FC<CollectionPageProps> = ({ collection, onSelectRecord, onDeleteRecord, onStartCompare }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [isCompareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<AnalysisRecord[]>([]);
  const [isManaging, setIsManaging] = useState(false);

  const uniqueSets = useMemo(() => {
    const sets = new Set(collection.map(record => record.result.cardInfo.set).filter(Boolean));
    return Array.from(sets).sort();
  }, [collection]);

  const filteredAndSortedCollection = useMemo(() => {
    return collection
      .filter(record => {
        const nameMatch = record.result.cardInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const setMatch = selectedSet === 'all' || record.result.cardInfo.set === selectedSet;
        return nameMatch && setMatch;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'date_asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'value_desc':
            return parseMarketValue(b.result.marketValue.psa9) - parseMarketValue(a.result.marketValue.psa9);
          case 'value_asc':
            return parseMarketValue(a.result.marketValue.psa9) - parseMarketValue(b.result.marketValue.psa9);
          case 'date_desc':
          default:
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });
  }, [collection, searchTerm, sortOrder, selectedSet]);
  
  const handleToggleCompareMode = () => {
      if (isManaging) setIsManaging(false);
      setCompareMode(!isCompareMode);
      setSelectedForCompare([]);
  };

  const handleToggleManageMode = () => {
      if (isCompareMode) {
          setCompareMode(false);
          setSelectedForCompare([]);
      }
      setIsManaging(!isManaging);
  };

  const handleToggleCompareItem = (record: AnalysisRecord) => {
      setSelectedForCompare(prev => {
          const isSelected = prev.some(r => r.id === record.id);
          if (isSelected) {
              return prev.filter(r => r.id !== record.id);
          }
          if (prev.length < 2) {
              return [...prev, record];
          }
          return prev;
      });
  };

  const handleCompare = () => {
      if (selectedForCompare.length === 2) {
          onStartCompare(selectedForCompare[0], selectedForCompare[1]);
          handleToggleCompareMode();
      }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Mi Colección ({collection.length})</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg backdrop-blur-sm">
        <div className="relative w-full md:w-auto md:flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input 
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors"
            >
                <option value="all">Todos los Sets</option>
                {uniqueSets.map(set => (
                    <option key={set} value={set}>{set}</option>
                ))}
            </select>
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors"
            >
                <option value="date_desc">Más Reciente</option>
                <option value="date_asc">Más Antiguo</option>
                <option value="value_desc">Mayor Valor</option>
                <option value="value_asc">Menor Valor</option>
            </select>
            <div className="flex items-center bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-md p-1">
                <IconButton isActive={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={<LayoutGridIcon className="w-5 h-5" />} />
                <IconButton isActive={viewMode === 'list'} onClick={() => setViewMode('list')} icon={<ListBulletIcon className="w-5 h-5" />} />
            </div>
             <button
                onClick={handleToggleCompareMode}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border rounded-md transition-all duration-300 ${isCompareMode ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-[var(--accent-color)]' : 'hover:border-[var(--accent-color)]/50 hover:text-[var(--accent-color)]'}`}
             >
                <ScaleIcon className="w-4 h-4" />
                <span>{isCompareMode ? 'Cancelar' : 'Comparar'}</span>
             </button>
             <button
                onClick={handleToggleManageMode}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border rounded-md transition-all duration-300 ${isManaging ? 'bg-red-500/20 border-red-500 text-red-400' : 'hover:border-red-500/50 hover:text-red-400'}`}
             >
                <TrashIcon className="w-4 h-4" />
                <span>{isManaging ? 'Finalizar' : 'Eliminar'}</span>
             </button>
        </div>
      </div>
      
      {isCompareMode && (
          <div className="flex justify-between items-center mb-6 p-3 bg-cyan-900/50 border border-cyan-700 rounded-lg animate-fade-in">
              <p className="text-cyan-200 font-semibold">Selecciona dos cartas para comparar ({selectedForCompare.length}/2)</p>
              <button 
                  onClick={handleCompare}
                  disabled={selectedForCompare.length !== 2}
                  className="px-4 py-2 bg-cyan-500 text-white font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
              >
                  Comparar
              </button>
          </div>
      )}

      {isManaging && (
          <div className="flex justify-between items-center mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg animate-fade-in">
              <p className="text-red-200 font-semibold">Modo de eliminación: pasa el cursor sobre una carta y haz clic en el icono para eliminarla.</p>
          </div>
      )}

      {/* Content */}
      {filteredAndSortedCollection.length > 0 ? (
        viewMode === 'grid' 
            ? <GridView collection={filteredAndSortedCollection} onSelect={onSelectRecord} isCompareMode={isCompareMode} selectedForCompare={selectedForCompare.map(r => r.id)} onToggleCompare={handleToggleCompareItem} isManaging={isManaging} onDelete={onDeleteRecord} />
            : <ListView collection={filteredAndSortedCollection} onSelect={onSelectRecord} onDelete={onDeleteRecord} />
      ) : (
        <div className="text-center py-20 bg-[var(--panel-color)] border border-dashed border-[var(--border-color)] rounded-lg">
            <p className="text-lg font-semibold">No se encontraron resultados</p>
            <p className="text-[var(--text-secondary)] mt-2">{searchTerm || selectedSet !== 'all' ? "Intenta con otros filtros." : "Tu colección está vacía."}</p>
        </div>
      )}
    </div>
  );
};

// --- View Components ---

const GridView: React.FC<GridViewProps> = ({ collection, onSelect, isCompareMode, selectedForCompare, onToggleCompare, isManaging, onDelete }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {collection.map(record => {
            const isSelectedForCompare = selectedForCompare.includes(record.id);
            return (
                <div 
                    key={record.id} 
                    className={`group relative aspect-[3/4] overflow-hidden rounded-lg transition-all duration-300 border-2 ${
                        isSelectedForCompare ? 'border-[var(--accent-color)]' : 'border-[var(--border-color)]'
                    } ${!isManaging ? 'cursor-pointer hover:border-[var(--accent-color)]' : ''}`}
                    onClick={() => {
                        if (isManaging) return;
                        if (isCompareMode) onToggleCompare(record);
                        else onSelect(record);
                    }}
                >
                    <img src={record.imageDataUrl} alt={record.result.cardInfo.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    {!isCompareMode && !isManaging && <div className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 20px 0 var(--accent-glow)` }}></div>}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/50 backdrop-blur-sm">
                         <p className="text-xs font-bold text-white truncate">{record.result.cardInfo.name}</p>
                    </div>
                    {isSelectedForCompare && (
                        <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                            <CheckCircleIcon className="w-12 h-12 text-white" />
                        </div>
                    )}
                    {isManaging && (
                        <>
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(record.id);
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-red-600/80 rounded-full text-white hover:bg-red-500 transition-all transform opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-200"
                                aria-label="Eliminar carta"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>
            )
        })}
    </div>
);

const ListView: React.FC<ListViewProps> = ({ collection, onSelect, onDelete }) => (
    <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg backdrop-blur-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-xs text-[var(--text-secondary)] uppercase">
                <tr>
                    <th scope="col" className="px-6 py-3">Carta</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Set</th>
                    <th scope="col" className="px-6 py-3 text-center">Potencial Gema</th>
                    <th scope="col" className="px-6 py-3 text-right">Valor Est. (PSA 9)</th>
                    <th scope="col" className="px-1 py-3"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
                {collection.map(record => (
                    <tr key={record.id} onClick={() => onSelect(record)} className="hover:bg-white/5 cursor-pointer">
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                                <img src={record.imageDataUrl} alt={record.result.cardInfo.name} className="w-10 h-14 object-cover rounded-sm" />
                                <span>{record.result.cardInfo.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)] hidden md:table-cell">{record.result.cardInfo.set}</td>
                        <td className="px-6 py-4 text-center font-bold text-lg text-[var(--accent-color)]">{record.result.probabilities.psa10}%</td>
                        <td className="px-6 py-4 text-right font-semibold">{record.result.marketValue.psa9}</td>
                        <td className="px-1 py-4 text-right">
                           <button
                                onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                className="p-2 text-[var(--text-secondary)] rounded-full hover:bg-red-500/20 hover:text-red-400"
                            >
                                <XMarkIcon className="w-4 h-4" />
                           </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const IconButton: React.FC<{ isActive: boolean, onClick: () => void, icon: React.ReactNode }> = ({ isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-md transition-colors ${isActive ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-white/10 text-[var(--text-secondary)]'}`}
    >
        {icon}
    </button>
);


export default CollectionPage;