import React from 'react';

interface LoaderProps {
  progress?: { current: number; total: number } | null;
}

const Loader: React.FC<LoaderProps> = ({ progress }) => {
  const title = progress ? `ANALIZANDO CARTA ${progress.current} DE ${progress.total}` : 'ANALIZANDO';
  const subtitle = progress ? 'Procesando lote de cartas...' : 'La IA está examinando cada detalle.';

  return (
    <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="relative w-24 h-24 flex items-center justify-center">
             <div className="absolute h-16 w-16 animate-spin-slow border-2 border-[var(--accent-color)] rounded-sm"></div>
             <div className="absolute h-10 w-10 bg-[var(--accent-color)] opacity-75 animate-pulse rounded-sm"></div>
        </div>
        <div className="text-center mt-8">
            <p className="text-xl font-bold text-[var(--text-primary)] tracking-widest uppercase">{title}</p>
            <p className="text-md text-[var(--text-secondary)] mt-2">{subtitle}</p>
            {progress && (
              <div className="w-64 bg-slate-700 rounded-full h-2.5 mt-4">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
              </div>
            )}
        </div>
        <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 3s linear infinite;
            }
        `}</style>
    </div>
  );
};

export default Loader;