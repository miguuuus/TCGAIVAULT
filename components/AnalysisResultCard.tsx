import React, { useState, useMemo } from 'react';
import type { AnalysisRecord, Defect } from '../types';
import { DiamondIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, InformationCircleIcon, ArrowUpOnSquareIcon } from './icons';

interface AnalysisResultCardProps {
  record: AnalysisRecord;
  onBack: () => void;
}

type Tab = 'summary' | 'analysis' | 'market';

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ record, onBack }) => {
  const { result } = record;
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [isSharing, setIsSharing] = useState(false);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Card Image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = record.imageDataUrl;
        await new Promise(resolve => { img.onload = resolve; });
        
        const cardAspectRatio = img.width / img.height;
        const cardHeight = 550;
        const cardWidth = cardHeight * cardAspectRatio;
        ctx.drawImage(img, 40, 40, cardWidth, cardHeight);

        // Text Content
        const textX = cardWidth + 80;
        ctx.fillStyle = '#f8fafc'; // slate-50

        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillText(result.cardInfo.name, textX, 100, canvas.width - textX - 40);

        ctx.font = '28px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.fillText(result.cardInfo.set, textX, 145, canvas.width - textX - 40);

        ctx.strokeStyle = '#1e293b'; // slate-800
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(textX, 180);
        ctx.lineTo(canvas.width - 40, 180);
        ctx.stroke();

        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('Potencial de Grado', textX, 240);

        const bestGrade = Object.entries(result.probabilities).reduce((a, b) => a[1] > b[1] ? a : b);
        
        ctx.font = 'bold 96px Inter, sans-serif';
        ctx.fillStyle = '#06b6d4'; // cyan-500
        ctx.fillText(`${bestGrade[1]}%`, textX, 350);

        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(bestGrade[0].toUpperCase(), textX, 410);

        ctx.font = 'italic 20px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Analizado por TCG.AI VAULT', textX, 580);


        const dataUrl = canvas.toDataURL('image/png');
        const file = dataURLtoFile(dataUrl, 'tcg-grade-analysis.png');

        if (navigator.share) {
            await navigator.share({
                title: `Análisis de ${result.cardInfo.name}`,
                text: `¡Mira el potencial de grado de mi ${result.cardInfo.name}! Analizado con TCG.AI Vault.`,
                files: [file],
            });
        } else {
            // Fallback for desktop/unsupported browsers
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'tcg-grade-analysis.png';
            link.click();
        }
    } catch (error) {
        console.error('Error sharing:', error);
    } finally {
        setIsSharing(false);
    }
  };


  const TabButton: React.FC<{ tabId: Tab; title: string; }> = ({ tabId, title }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${activeTab === tabId ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
    >
      {title}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-slide-up">
      <div className="flex justify-between items-center mb-2">
        <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-300 group"
        >
            <ArrowLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-semibold">Volver a la Colección</span>
        </button>
        <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md text-[var(--text-secondary)] hover:border-[var(--accent-color)]/50 hover:text-[var(--accent-color)] transition-colors duration-300 disabled:opacity-50"
        >
            <ArrowUpOnSquareIcon className="w-5 h-5" />
            <span>{isSharing ? 'Compartiendo...' : 'Compartir'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Image and Static Info */}
        <div className="md:col-span-1 flex flex-col space-y-4">
          <div className="relative group/card">
             <img src={record.imageDataUrl} alt="Carta analizada" className="w-full rounded-lg border border-[var(--border-color)] shadow-2xl shadow-black/50" />
             {result.defects && result.defects.map((defect, index) => (
                <div 
                    key={index}
                    className="absolute group/defect"
                    style={{
                        left: `${defect.box.x}%`,
                        top: `${defect.box.y}%`,
                        width: `${defect.box.width}%`,
                        height: `${defect.box.height}%`,
                    }}
                >
                    <div className="w-full h-full border-2 border-red-500 bg-red-500/20 rounded-sm animate-pulse-slow"></div>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs p-2 text-xs text-center text-white bg-slate-900 border border-slate-700 rounded-md shadow-lg opacity-0 group-hover/defect:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        {defect.description}
                    </div>
                </div>
             ))}
          </div>

          <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-2 uppercase tracking-wider">{result.cardInfo.name}</h3>
            <p className="text-sm text-center text-[var(--text-secondary)]">{result.cardInfo.set}</p>
          </div>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="md:col-span-2">
          <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-4 md:p-6 backdrop-blur-sm min-h-[500px]">
            <div className="flex items-center space-x-2 border-b border-[var(--border-color)] mb-6">
              <TabButton tabId="summary" title="Resumen" />
              <TabButton tabId="analysis" title="Análisis Detallado" />
              <TabButton tabId="market" title="Valor de Mercado" />
            </div>

            <div className="animate-fade-in">
              {activeTab === 'summary' && <SummaryTab result={result} />}
              {activeTab === 'analysis' && <AnalysisTab result={result} />}
              {activeTab === 'market' && <MarketTab result={result} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component for Centering Visualization ---
const CenteringVisualizer: React.FC<{ vertical: string; horizontal: string }> = ({ vertical, horizontal }) => {
    const parseRatio = (str: string): [number, number] | null => {
        const match = str.match(/(\d+)\s*\/\s*(\d+)/);
        if (match) return [parseInt(match[1], 10), parseInt(match[2], 10)];
        return null;
    };

    const verticalRatio = parseRatio(vertical);
    const horizontalRatio = parseRatio(horizontal);

    const CenteringBar: React.FC<{label1: string, val1: number, label2: string, val2: number}> = ({label1, val1, label2, val2}) => (
        <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{label1}</span>
                <span>{label2}</span>
            </div>
            <div className="flex w-full h-6 bg-slate-800 rounded-md overflow-hidden border border-slate-700">
                <div 
                    style={{ width: `${val1}%` }} 
                    className="bg-cyan-600/50 flex items-center justify-center text-sm font-bold text-white transition-all duration-500"
                >
                    {val1}%
                </div>
                <div 
                    style={{ width: `${val2}%` }} 
                    className="bg-slate-700/50 flex items-center justify-center text-sm font-bold text-white transition-all duration-500"
                >
                    {val2}%
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-4">
            {horizontalRatio ? (
                <CenteringBar label1="Izquierda" val1={horizontalRatio[0]} label2="Derecha" val2={horizontalRatio[1]} />
            ) : (
                <p className="text-sm text-slate-300">Horizontal: {horizontal}</p>
            )}
            {verticalRatio ? (
                <CenteringBar label1="Arriba" val1={verticalRatio[0]} label2="Abajo" val2={verticalRatio[1]} />
            ) : (
                <p className="text-sm text-slate-300">Vertical: {vertical}</p>
            )}
        </div>
    );
};

// --- Tab Content Components ---

const SummaryTab: React.FC<{ result: AnalysisRecord['result'] }> = ({ result }) => {
  const isRecommended = result.recommendation.toLowerCase().includes('recomendado');
  const probabilityGrades = Object.entries(result.probabilities)
    .map(([key, value]) => ({
      grade: parseInt(key.replace('psa', ''), 10),
      probability: value,
    }))
    .sort((a, b) => b.grade - a.grade);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-4 uppercase tracking-widest">Veredicto de la IA</h3>
        <div className={`flex items-center justify-center p-4 rounded-md ${isRecommended ? 'bg-cyan-500/10 text-cyan-300' : 'bg-red-500/10 text-red-300'}`}>
          {isRecommended ? <CheckCircleIcon className="w-6 h-6 mr-3 flex-shrink-0" /> : <XCircleIcon className="w-6 h-6 mr-3 flex-shrink-0" />}
          <p className="font-bold">{result.recommendation}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-5 uppercase tracking-widest">Probabilidad de Gradeo</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {probabilityGrades.slice(0, 5).map(({ grade, probability }) => (
            <ProbabilityBar key={grade} grade={`PSA ${grade}`} probability={probability} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalysisTab: React.FC<{ result: AnalysisRecord['result'] }> = ({ result }) => {
    const defectsByType = useMemo(() => {
        const grouped: { [key in Defect['type']]: Defect[] } = {
            corner: [],
            edge: [],
            surface: [],
            centering: []
        };
        (result.defects || []).forEach(defect => {
            if (grouped[defect.type]) {
                grouped[defect.type].push(defect);
            }
        });
        return grouped;
    }, [result.defects]);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-5 uppercase tracking-widest">Análisis Forense</h3>
            
            <AnalysisDetail
                title="Centrado"
                description={<CenteringVisualizer vertical={result.centering.vertical} horizontal={result.centering.horizontal} />}
            />
            
            <AnalysisDefectSection title="Defectos en Esquinas" defects={defectsByType.corner} />
            <AnalysisDefectSection title="Defectos en Bordes" defects={defectsByType.edge} />
            <AnalysisDefectSection title="Defectos en Superficie" defects={defectsByType.surface} />
        </div>
    );
};

const MarketTab: React.FC<{ result: AnalysisRecord['result'] }> = ({ result }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-5 uppercase tracking-widest">Estimación de Valor de Mercado</h3>
        <div className="space-y-3 text-md">
            <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">PSA 10:</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">{result.marketValue.psa10}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">PSA 9:</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">{result.marketValue.psa9}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">PSA 8:</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">{result.marketValue.psa8}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">PSA 7:</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">{result.marketValue.psa7}</span>
            </div>
        </div>

        {result.marketValueDetails && (
            <div className="mt-6">
                <h4 className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-sm mb-2">Análisis del Analista</h4>
                <div className="text-sm text-[var(--text-primary)]/90 leading-relaxed p-4 bg-[var(--border-color)]/30 rounded-md border-l-2 border-cyan-500">
                    <p>{result.marketValueDetails}</p>
                </div>
            </div>
        )}

         <div className="mt-6 flex items-start space-x-3 text-xs text-[var(--text-secondary)]/80 p-3 bg-[var(--border-color)]/30 rounded-md">
            <InformationCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p>{result.marketValue.disclaimer}</p>
        </div>
    </div>
);


// --- Helper Components ---

const AnalysisDetail: React.FC<{ title: string; description: React.ReactNode }> = ({ title, description }) => (
  <div>
      <h4 className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-sm mb-2">{title}</h4>
      <div className="text-md text-[var(--text-primary)] leading-relaxed pl-5 border-l-2 border-[var(--border-color)]">
        {description}
      </div>
  </div>
);

const AnalysisDefectSection: React.FC<{ title: string, defects: Defect[] }> = ({ title, defects }) => {
    if (defects.length === 0) {
        return (
             <AnalysisDetail 
                title={title}
                description={<span className="text-green-400">No se encontraron defectos notables.</span>}
            />
        );
    }

    return (
        <AnalysisDetail 
            title={title}
            description={
                <ul className="space-y-2">
                    {defects.map((defect, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <DiamondIcon className="w-2.5 h-2.5 text-[var(--accent-color)] mt-1.5 flex-shrink-0" />
                            <span>{defect.description}</span>
                        </li>
                    ))}
                </ul>
            }
        />
    )
}

const ProbabilityBar: React.FC<{ grade: string; probability: number }> = ({ grade, probability }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{grade}</span>
      <span className="text-sm font-bold text-[var(--text-primary)]">{probability}%</span>
    </div>
    <div className="w-full bg-[var(--border-color)] rounded-full h-1.5">
      <div className="bg-[var(--accent-color)] h-1.5 rounded-full" style={{ width: `${probability}%`, boxShadow: `0 0 8px var(--accent-glow)` }}></div>
    </div>
  </div>
);

export default AnalysisResultCard;