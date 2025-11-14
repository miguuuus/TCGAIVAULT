import React, { useState, useCallback, useEffect } from 'react';
import Loader from './components/Loader';
import AnalysisResultCard from './components/AnalysisResultCard';
import CameraView from './components/CameraView';
import Sidebar from './components/Sidebar';
import AnalysisModal from './components/AnalysisModal';
import Dashboard from './components/Dashboard';
import CollectionPage from './components/CollectionPage';
import GuidePage from './components/GuidePage';
import SettingsPage from './components/SettingsPage';
import ComparisonView from './components/ComparisonView';
import UpgradeModal from './components/UpgradeModal';
import MarketplacePage from './components/MarketplacePage';
import MarketDetailModal from './components/MarketDetailModal';
import { analyzeCardImage } from './services/geminiService';
import { AnalysisResult, AnalysisRecord, MAX_FREE_COLLECTION_ITEMS, MarketOpportunityCard } from './types';


type View = 'dashboard' | 'collection' | 'market' | 'guide' | 'settings';
type Theme = 'light' | 'dark';

const cleanAndParseJson = <T,>(jsonString: string): T => {
    // Tries to find the JSON block in a markdown string
    const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    const strToParse = match ? match[1] : jsonString;
    try {
        return JSON.parse(strToParse) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", strToParse);
        // Fallback to parsing the original string if the regex fails but it might be valid JSON
        try {
            return JSON.parse(jsonString) as T;
        } catch (e2) {
             console.error("Failed to parse original JSON string:", jsonString);
             throw new Error("Invalid JSON response from AI.");
        }
    }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [collection, setCollection] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number } | null>(null);
  const [comparisonPair, setComparisonPair] = useState<[AnalysisRecord, AnalysisRecord] | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isProUser, setIsProUser] = useState(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedMarketOpportunity, setSelectedMarketOpportunity] = useState<MarketOpportunityCard | null>(null);


  useEffect(() => {
    // Load collection from localStorage
    try {
      const storedCollection = localStorage.getItem('analysisCollection_v2');
      if (storedCollection) {
        setCollection(JSON.parse(storedCollection));
      }
      const proStatus = localStorage.getItem('isProUser');
      if (proStatus === 'true') {
        setIsProUser(true);
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
    
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('appTheme') as Theme;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    // Check for successful payment redirect from Stripe
    const checkProStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('pro_unlocked') === 'true') {
        if (!isProUser) {
            setIsProUser(true);
            localStorage.setItem('isProUser', 'true');
            setSuccessMessage('¡Bienvenido a PRO! Has desbloqueado todas las funciones.');
            setTimeout(() => setSuccessMessage(null), 5000);
        }
        
        // Clean the URL to avoid re-triggering
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    };
    checkProStatus();
  }, [isProUser]);
  
  useEffect(() => {
    // Apply theme to HTML element
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('light');
    } else {
        root.classList.remove('light');
    }
    // Save theme to localStorage
    try {
        localStorage.setItem('appTheme', theme);
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  const saveCollection = (newCollection: AnalysisRecord[]) => {
    try {
      localStorage.setItem('analysisCollection_v2', JSON.stringify(newCollection));
      setCollection(newCollection);
    } catch(e) {
      console.error("Failed to save collection to localStorage", e);
    }
  }

  const resizeAndConvertImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const MAX_DIMENSION = 1024;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) return reject(new Error("FileReader did not return a result."));
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
  };

  const handleAnalysisRequest = useCallback(async (files: File[]) => {
    if (collection.length >= MAX_FREE_COLLECTION_ITEMS && !isProUser) {
        setUpgradeModalOpen(true);
        return;
    }

    setAnalysisModalOpen(false);
    setIsLoading(true);
    setError(null);
    const isBatch = files.length > 1;
    if(isBatch) setBatchProgress({ current: 1, total: files.length });

    let newRecords: AnalysisRecord[] = [];

    try {
      let currentCollection = [...collection];
      for (let i = 0; i < files.length; i++) {
        if (currentCollection.length >= MAX_FREE_COLLECTION_ITEMS && !isProUser) {
            setUpgradeModalOpen(true);
            break;
        }

        const file = files[i];
        if (isBatch) setBatchProgress({ current: i + 1, total: files.length });

        const imageDataUrl = await resizeAndConvertImage(file);
        const base64Data = imageDataUrl.split(',')[1];
        const jsonResponse = await analyzeCardImage('image/jpeg', base64Data);
        const result = cleanAndParseJson<AnalysisResult>(jsonResponse);
        
        const newRecord: AnalysisRecord = {
          id: `${new Date().toISOString()}-${i}`,
          date: new Date().toISOString(),
          imageDataUrl,
          result
        };
        newRecords.push(newRecord);
        
        const updatedCollection = [newRecord, ...currentCollection];
        saveCollection(updatedCollection);
        currentCollection = updatedCollection;
      }
      
      if (!isBatch && newRecords.length > 0) {
        setSelectedRecord(newRecords[0]);
      } else if (isBatch) {
        setActiveView('collection'); // Navigate to collection after batch
      }

    } catch (err) {
      console.error(err);
      setError('Hubo un error al analizar la carta. Por favor, inténtalo de nuevo.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  }, [collection, isProUser]);

  const handleSelectCollection = (record: AnalysisRecord) => {
    setSelectedRecord(record);
  }
  
  const handleDeleteFromCollection = (id: string) => {
    const updatedCollection = collection.filter(record => record.id !== id);
    saveCollection(updatedCollection);
  };

  const handleBackToMainView = () => {
    setSelectedRecord(null);
  }

  const handleStartCompare = (record1: AnalysisRecord, record2: AnalysisRecord) => {
    setComparisonPair([record1, record2]);
  }
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const renderContent = () => {
    if (selectedRecord) {
        return <AnalysisResultCard record={selectedRecord} onBack={handleBackToMainView} />
    }
    switch(activeView) {
        case 'dashboard':
            return <Dashboard collection={collection} onSelectRecord={handleSelectCollection} />;
        case 'collection':
            return <CollectionPage collection={collection} onSelectRecord={handleSelectCollection} onDeleteRecord={handleDeleteFromCollection} onStartCompare={handleStartCompare} />;
        case 'market':
            return <MarketplacePage isProUser={isProUser} onOpenUpgradeModal={() => setUpgradeModalOpen(true)} onSelectOpportunity={setSelectedMarketOpportunity} />;
        case 'guide':
            return <GuidePage />;
        case 'settings':
            return <SettingsPage currentTheme={theme} onThemeChange={handleThemeChange} />;
        default:
            return <Dashboard collection={collection} onSelectRecord={handleSelectCollection} />;
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--bg-color)]">
      {isLoading && <Loader progress={batchProgress} />}
      {comparisonPair && <ComparisonView records={comparisonPair} onClose={() => setComparisonPair(null)} />}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
      {selectedMarketOpportunity && <MarketDetailModal opportunity={selectedMarketOpportunity} onClose={() => setSelectedMarketOpportunity(null)} />}
      
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        onAnalyzeClick={() => {
            if (collection.length >= MAX_FREE_COLLECTION_ITEMS && !isProUser) {
                setUpgradeModalOpen(true);
            } else {
                setAnalysisModalOpen(true);
            }
        }}
        isProUser={isProUser}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        onImageSelect={handleAnalysisRequest}
        isLoading={isLoading}
        isProUser={isProUser}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-28 md:pb-8">
        {renderContent()}
        {error && (
            <div className="fixed bottom-20 md:bottom-5 right-5 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up border border-red-400 z-50">
                {error}
            </div>
        )}
        {successMessage && (
            <div className="fixed bottom-20 md:bottom-5 right-5 bg-green-500/90 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up border border-green-400 z-50">
                {successMessage}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;