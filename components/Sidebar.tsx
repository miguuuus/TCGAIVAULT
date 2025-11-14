import React from 'react';
import { CardStackIcon, Cog6ToothIcon, LayoutGridIcon, PlusCircleIcon, BookOpenIcon, SparklesIcon } from './icons';

type View = 'dashboard' | 'collection' | 'guide' | 'settings';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onAnalyzeClick: () => void;
  isProUser: boolean;
  onOpenUpgradeModal: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDesktop?: boolean;
  desktopLabel?: string;
}> = ({ icon, label, isActive, onClick, isDesktop = false, desktopLabel }) => (
  <button
    onClick={onClick}
    title={desktopLabel || label}
    className={`
      flex items-center rounded-md transition-colors duration-200 group
      ${isDesktop 
        ? `w-full px-3 py-2.5 justify-start text-left ${isActive ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'}`
        : `flex-col flex-1 h-full justify-center text-center ${isActive ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-white'}`
      }
    `}
  >
    <div className="w-6 h-6 flex-shrink-0">{icon}</div>
    <span className={`
      font-semibold whitespace-nowrap
      ${isDesktop 
        ? 'ml-3 text-base' 
        : 'mt-1 text-xs'
      }
    `}>
      {isDesktop ? (desktopLabel || label) : label}
    </span>
  </button>
);


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onAnalyzeClick, isProUser, onOpenUpgradeModal }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen bg-[var(--sidebar-color)] border-r border-[var(--border-color)] flex-col p-4 flex-shrink-0 w-64">
        <div className="flex items-center justify-start mb-10 h-8">
          <h1 className="text-2xl font-black tracking-tighter text-white whitespace-nowrap">
            TCG.AI <span className="text-[var(--accent-color)]">VAULT</span>
          </h1>
        </div>
        <button
          onClick={onAnalyzeClick}
          title="Analizar Carta"
          className="flex items-center justify-center w-full py-3 mb-4 bg-[var(--accent-color)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-[0_0_20px_var(--accent-glow)]"
        >
          <PlusCircleIcon className="w-6 h-6 flex-shrink-0" />
          <span className="font-bold ml-2 whitespace-nowrap">Analizar Carta</span>
        </button>
        {!isProUser && (
            <button
                onClick={onOpenUpgradeModal}
                className="flex items-center justify-center w-full py-2.5 mb-8 bg-amber-500/10 text-amber-400 font-bold rounded-lg hover:bg-amber-500/20 transition-colors duration-200 border border-amber-500/30 group"
            >
                <SparklesIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-bold ml-2 whitespace-nowrap">Hazte PRO</span>
            </button>
        )}
        <nav className="flex flex-col space-y-2 flex-grow">
          <NavItem isDesktop={true} icon={<LayoutGridIcon />} label="Panel" desktopLabel="Panel Principal" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem isDesktop={true} icon={<CardStackIcon />} label="Colección" isActive={activeView === 'collection'} onClick={() => setActiveView('collection')} />
          <NavItem isDesktop={true} icon={<BookOpenIcon />} label="Guía" desktopLabel="Guía de Fotos" isActive={activeView === 'guide'} onClick={() => setActiveView('guide')} />
        </nav>
        <div className="mt-auto">
          <NavItem isDesktop={true} icon={<Cog6ToothIcon />} label="Ajustes" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--sidebar-color)] border-t border-[var(--border-color)] z-30 flex items-stretch justify-around px-1">
        <NavItem icon={<LayoutGridIcon />} label="Panel" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavItem icon={<CardStackIcon />} label="Colección" isActive={activeView === 'collection'} onClick={() => setActiveView('collection')} />
        
        {/* Central Floating Action Button (FAB) placeholder */}
        <div className="w-14" />

        <NavItem icon={<BookOpenIcon />} label="Guía" isActive={activeView === 'guide'} onClick={() => setActiveView('guide')} />
        {!isProUser ? (
             <NavItem icon={<SparklesIcon />} label="PRO" isActive={false} onClick={onOpenUpgradeModal} />
        ) : (
             <NavItem icon={<Cog6ToothIcon />} label="Ajustes" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        )}
      </nav>
       {/* The FAB itself needs to be outside the nav to be centered and elevated properly */}
       <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={onAnalyzeClick}
          title="Analizar Carta"
          className="flex items-center justify-center w-16 h-16 bg-[var(--accent-color)] text-white font-bold rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-black/50"
        >
          <PlusCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;