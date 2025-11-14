import React from 'react';
import type { AnalysisRecord } from '../types';
import { XMarkIcon, DiamondIcon } from './icons';

interface ComparisonViewProps {
  records: [AnalysisRecord, AnalysisRecord];
  onClose: () => void;
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

const ComparisonView: React.FC<ComparisonViewProps> = ({ records, onClose }) => {
  const [record1, record2] = records;
  
  const getDefectCount = (record: AnalysisRecord) => record.result.defects?.length || 0;
  
  const getMarketValueForGrade = (record: AnalysisRecord, grade: 'psa10' | 'psa9') => {
      return parseMarketValue(record.result.marketValue[grade]);
  }

  const ComparisonRow: React.FC<{ 
      label: string; 
      value1: React.ReactNode; 
      value2: React.ReactNode; 
      highlight?: 'v1' | 'v2' | 'none'
  }> = ({ label, value1, value2, highlight = 'none' }) => {
      const getHighlightClass = (val: 'v1' | 'v2') => (highlight === val ? 'text-green-400 font-bold' : '');
      
      return (
        <tr className="border-b border-slate-800 last:border-b-0">
            <td className={`p-3 text-center ${getHighlightClass('v1')}`}>{value1}</td>
            <td className="p-3 text-center text-slate-400 font-semibold">{label}</td>
            <td className={`p-3 text-center ${getHighlightClass('v2')}`}>{value2}</td>
        </tr>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-xl shadow-2xl shadow-black/50 w-full max-w-5xl m-4 animate-slide-up h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b border-slate-800 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">Comparación de Cartas</h2>
                <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-white/10 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Card Images and Info */}
                    {[record1, record2].map((record, index) => (
                        <div key={index} className="text-center">
                            <img src={record.imageDataUrl} alt={record.result.cardInfo.name} className="w-full max-w-xs mx-auto rounded-lg border-2 border-slate-700" />
                            <h3 className="text-lg font-bold mt-3">{record.result.cardInfo.name}</h3>
                            <p className="text-sm text-slate-400">{record.result.cardInfo.set}</p>
                        </div>
                    ))}
                </div>
                
                <div className="px-6 pb-6">
                    <table className="w-full text-sm">
                        <tbody className="bg-slate-900/50 rounded-lg">
                            <ComparisonRow 
                                label="Centrado Vertical"
                                value1={record1.result.centering.vertical}
                                value2={record2.result.centering.vertical}
                            />
                             <ComparisonRow 
                                label="Centrado Horizontal"
                                value1={record1.result.centering.horizontal}
                                value2={record2.result.centering.horizontal}
                            />
                            <ComparisonRow 
                                label="Nº de Defectos"
                                value1={getDefectCount(record1)}
                                value2={getDefectCount(record2)}
                                highlight={getDefectCount(record1) < getDefectCount(record2) ? 'v1' : getDefectCount(record2) < getDefectCount(record1) ? 'v2' : 'none'}
                            />
                            <ComparisonRow 
                                label="Prob. PSA 10"
                                value1={`${record1.result.probabilities.psa10}%`}
                                value2={`${record2.result.probabilities.psa10}%`}
                                highlight={record1.result.probabilities.psa10 > record2.result.probabilities.psa10 ? 'v1' : record2.result.probabilities.psa10 > record1.result.probabilities.psa10 ? 'v2' : 'none'}
                            />
                             <ComparisonRow 
                                label="Prob. PSA 9"
                                value1={`${record1.result.probabilities.psa9}%`}
                                value2={`${record2.result.probabilities.psa9}%`}
                                highlight={record1.result.probabilities.psa9 > record2.result.probabilities.psa9 ? 'v1' : record2.result.probabilities.psa9 > record1.result.probabilities.psa9 ? 'v2' : 'none'}
                            />
                            <ComparisonRow 
                                label="Valor Est. PSA 10"
                                value1={record1.result.marketValue.psa10}
                                value2={record2.result.marketValue.psa10}
                                highlight={getMarketValueForGrade(record1, 'psa10') > getMarketValueForGrade(record2, 'psa10') ? 'v1' : getMarketValueForGrade(record2, 'psa10') > getMarketValueForGrade(record1, 'psa10') ? 'v2' : 'none'}
                            />
                            <ComparisonRow 
                                label="Valor Est. PSA 9"
                                value1={record1.result.marketValue.psa9}
                                value2={record2.result.marketValue.psa9}
                                highlight={getMarketValueForGrade(record1, 'psa9') > getMarketValueForGrade(record2, 'psa9') ? 'v1' : getMarketValueForGrade(record2, 'psa9') > getMarketValueForGrade(record1, 'psa9') ? 'v2' : 'none'}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ComparisonView;