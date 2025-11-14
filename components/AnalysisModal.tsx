import React, { useState, useCallback, useRef } from 'react';
import { CameraIcon, UploadIcon, XMarkIcon } from './icons';
import CameraView from './CameraView';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (files: File[]) => void;
  isLoading: boolean;
  isProUser: boolean;
  onOpenUpgradeModal: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, onImageSelect, isLoading, isProUser, onOpenUpgradeModal }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        if (files.length > 1 && !isProUser) {
            onOpenUpgradeModal();
        } else {
            onImageSelect(Array.from(files));
        }
    }
    event.target.value = '';
  };
  
  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleCapture = useCallback((file: File) => {
    setIsCameraOpen(false);
    onImageSelect([file]);
  }, [onImageSelect]);
  
  const handleClose = () => {
    if (isLoading) return;
    setIsCameraOpen(false);
    onClose();
  }

  const ActionButton: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, isPro?: boolean }> = ({ icon, title, subtitle, onClick, isPro }) => (
    <div 
        onClick={onClick}
        className="relative w-full h-full bg-slate-900/50 border border-[var(--border-color)] rounded-lg flex flex-col items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-color)] transition-all duration-300 cursor-pointer overflow-hidden group"
    >
        <div className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 20px 0 var(--accent-glow)` }}></div>
        {isPro && (
            <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                PRO
            </div>
        )}
        <div className="z-10 flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 mb-3 border-2 border-[var(--border-color)] rounded-full transition-colors duration-300 group-hover:border-[var(--accent-color)] group-hover:text-[var(--accent-color)]">
                {icon}
            </div>
            <p className="font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-xs">{subtitle}</p>
        </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in" onClick={handleClose}>
        <div 
            className="bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-xl shadow-2xl shadow-black/50 w-full max-w-lg m-4 p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Analizar Nueva(s) Carta(s)</h2>
                <button onClick={handleClose} className="p-1 text-gray-400 rounded-full hover:bg-white/10 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            {isCameraOpen ? (
                <div className="fixed inset-0 z-50">
                    <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-48">
                        <ActionButton 
                            icon={<UploadIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />}
                            title="Subir Foto(s)"
                            subtitle="Analiza en lote (PRO)"
                            onClick={triggerFileInput}
                            isPro={!isProUser}
                        />
                        <ActionButton 
                            icon={<CameraIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />}
                            title="Escanear Carta"
                            subtitle="Usa tu cámara"
                            onClick={() => setIsCameraOpen(true)}
                        />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isLoading}
                        multiple
                    />
                </>
            )}
        </div>
    </div>
  );
};

export default AnalysisModal;