import React, { useRef } from 'react';
import { CameraIcon, UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  onOpenCamera: () => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onOpenCamera, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageSelect(Array.from(files));
    }
    event.target.value = ''; // Reset input to allow same file selection
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };
  
  const handleCameraClick = () => {
    if (isLoading) return;
    onOpenCamera();
  }

  const ActionButton: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <div 
        onClick={onClick}
        className="relative w-full h-full bg-slate-900/50 border border-[var(--border-color)] rounded-lg flex flex-col items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-color)] transition-all duration-300 cursor-pointer overflow-hidden group"
    >
        <div className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 20px 0 var(--accent-glow)` }}></div>
        <div className="z-10 flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 mb-3 border-2 border-[var(--border-color)] rounded-full transition-colors duration-300 group-hover:border-[var(--accent-color)] group-hover:text-[var(--accent-color)]">
                {icon}
            </div>
            <p className="font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-xs">{subtitle}</p>
        </div>
    </div>
  );

  return (
    <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-48">
           <ActionButton 
              icon={<UploadIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />}
              title="Subir Foto(s)"
              subtitle="Selecciona una o varias"
              onClick={triggerFileInput}
            />
            <ActionButton 
              icon={<CameraIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />}
              title="Escanear Carta"
              subtitle="Usa tu cámara"
              onClick={handleCameraClick}
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
    </div>
  );
};

export default ImageUploader;