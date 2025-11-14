import React from 'react';
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start space-x-3">
        <CheckCircleIcon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <span className="text-slate-300">{children}</span>
    </div>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Construct the full success URL. Stripe will redirect to this after a successful payment.
  const successUrl = `${window.location.origin}${window.location.pathname}?pro_unlocked=true`;
  // The base payment link provided by the user.
  const basePaymentLink = 'https://buy.stripe.com/14A00k0563vB0tR20lgnK00';
  // Append the success_url as a query parameter for the Stripe checkout session.
  const paymentLinkWithRedirect = `${basePaymentLink}?success_url=${encodeURIComponent(successUrl)}`;

  return (
    <div className="fixed inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 w-full max-w-md m-4 p-8 animate-slide-up relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="absolute -top-1/4 -right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-64 h-64 bg-slate-800/20 rounded-full filter blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-amber-400" />
                        TCG.AI Vault PRO
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-white/10 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-slate-300 mb-6">Desbloquea todo el potencial de tu colección con las herramientas de nivel profesional.</p>

                <div className="space-y-4 mb-8">
                    <FeatureItem>
                        <strong>Análisis por Lotes:</strong> Analiza múltiples cartas a la vez y ahorra tiempo.
                    </FeatureItem>
                    <FeatureItem>
                        <strong>Bóveda Ilimitada:</strong> Elimina el límite de 50 cartas para tu colección.
                    </FeatureItem>
                    <FeatureItem>
                        <strong>Analíticas de Portfolio Avanzadas:</strong> Entiende el valor real de tu colección.
                    </FeatureItem>
                </div>
                
                <a 
                    href={paymentLinkWithRedirect}
                    className="block w-full text-center py-3 px-6 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_20px_var(--accent-glow)] transform hover:scale-105"
                >
                    Pagar y Desbloquear PRO - 19.99€
                </a>
                <p className="text-center text-xs text-slate-500 mt-3">Pago único. Acceso de por vida.</p>
            </div>
        </div>
    </div>
  );
};

export default UpgradeModal;