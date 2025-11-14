import React from 'react';
import { SunIcon, MoonIcon, InstagramIcon, EnvelopeIcon } from './icons';

type Theme = 'light' | 'dark';

interface SettingsPageProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-[var(--accent-color)] ${
      enabled ? 'bg-slate-300' : 'bg-slate-700'
    }`}
  >
    <span className="sr-only">Cambiar tema</span>
    <span
      className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition-transform duration-300 ease-in-out ${
        enabled ? 'translate-x-8' : 'translate-x-0'
      }`}
    >
      {enabled ? (
        <SunIcon className="h-4 w-4 text-yellow-500" />
      ) : (
        <MoonIcon className="h-4 w-4 text-slate-500" />
      )}
    </span>
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ currentTheme, onThemeChange }) => {
  const handleThemeToggle = (enabled: boolean) => {
    onThemeChange(enabled ? 'light' : 'dark');
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Ajustes</h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2">Personaliza la apariencia y el comportamiento de tu bóveda.</p>
      </div>
      
      <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-3">Apariencia</h3>
        
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-semibold text-[var(--text-primary)]">Modo de Color</h4>
                <p className="text-sm text-[var(--text-secondary)]">Elige entre un tema claro o uno oscuro.</p>
            </div>
            <ToggleSwitch
                enabled={currentTheme === 'light'}
                onChange={handleThemeToggle}
            />
        </div>
      </div>
      
      <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-3">Sobre el Creador</h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left">
                <h4 className="font-semibold text-[var(--text-primary)]">Proyecto creado por Maick TCG</h4>
                <p className="text-sm text-[var(--text-secondary)]">Sigue el proyecto y descubre más contenido TCG en Instagram.</p>
            </div>
            <a 
              href="https://instagram.com/maick_tcg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 sm:mt-0 flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300"
            >
              <InstagramIcon className="w-5 h-5" />
              <span>@maick_tcg</span>
            </a>
        </div>
      </div>

      <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-3">Colaboraciones</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-[var(--text-primary)]">Promociona tu Tienda o Servicio</h4>
            <p className="text-sm text-[var(--text-secondary)]">Si quieres colaborar o promocionar tu tienda/servicios de TCG en la app, contacta con nosotros.</p>
          </div>
          <a
            href="mailto:myspaceyt99@gmail.com"
            className="mt-4 sm:mt-0 flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-[var(--accent-color)]/20 border border-[var(--accent-color)] text-[var(--accent-color)] font-semibold rounded-lg hover:bg-[var(--accent-color)]/30 transition-colors duration-300"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Contactar</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;