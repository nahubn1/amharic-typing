import { useState, useEffect, useCallback } from 'react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { generateText } from './utils/textGenerator';
import type { Language } from './utils/textGenerator';
import TypingArea from './components/TypingArea';
import Results from './components/Results';
import type { Mode } from './components/ConfigBar';
import ConfigBar from './components/ConfigBar';
import { Keyboard, RefreshCw } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<Mode>('words');
  const [configValue, setConfigValue] = useState(25);
  const [language, setLanguage] = useState<Language>('amharic');
  // Enforce dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }, []);

  // Handle mode change with side effects to prevent cascading renders
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);

    // Adjust config value when mode changes if needed
    if (newMode === 'time' && !([15, 30, 60, 120].includes(configValue))) {
      setConfigValue(30);
    } else if (newMode === 'words' && !([10, 25, 50, 100].includes(configValue))) {
      setConfigValue(25);
    }
  };

  // Generate text based on mode - for time mode use large block for "infinite" text
  const getTextCount = useCallback(() => mode === 'words' ? configValue : 500, [mode, configValue]);

  const { text, userInput, isFinished, timeLeft, handleInput, reset, stats } = useTypingEngine(
    generateText(getTextCount(), language),
    mode,
    configValue
  );

  const handleRestart = useCallback(() => {
    reset(generateText(getTextCount(), language));
  }, [reset, language, getTextCount]);

  useEffect(() => {
    handleRestart();
  }, [mode, configValue, language, handleRestart]);

  // Tab key restart shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, configValue, language, handleRestart]);

  return (
    // We add a fragment to include the style tag without breaking the layout
    <>
      {/* FIX: Global style override 
        This style block forces the root container and body to span the full width
        overriding default Vite/React template styles that restrict width.
      */}
      <style>{`
        html, body, #root {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 dark:bg-[#323437] text-gray-800 dark:text-[#d1d0c5] flex flex-col font-mono w-full transition-colors duration-300">
        {/* Header */}
        <header className="p-8 w-full px-4 md:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-2xl font-bold text-yellow-600 dark:text-[#e2b714]">
            <Keyboard />
            <h1>ጦጣtype</h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            v1.2.0
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start pt-4 w-full px-2 relative min-h-[calc(100vh-200px)]">
          {!isFinished && (
            <>
              <ConfigBar
                mode={mode}
                setMode={handleModeChange}
                configValue={configValue}
                setConfigValue={setConfigValue}
                language={language}
                setLanguage={setLanguage}
              />
            </>
          )}

          {isFinished ? (
            <Results
              wpm={stats.wpm}
              accuracy={stats.accuracy}
              history={stats.history}
              charStats={stats.charStats}
              consistency={stats.consistency}
              raw={stats.raw}
              time={stats.time}
              onRestart={handleRestart}
              language={language}
            />
          ) : (
            <div className="flex flex-col items-center w-full max-w-6xl mt-12">
              <TypingArea
                text={text}
                userInput={userInput}
                isFinished={isFinished}
                onInput={handleInput}
                mode={mode}
                timeLeft={timeLeft}
                wordsTyped={userInput.trim().split(' ').filter(w => w.length > 0).length}
                totalWords={configValue}
              />

              {/* Restart Button */}
              <button
                onClick={handleRestart}
                className="mt-12 p-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-all"
                title="Restart Test (Tab)"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm w-full">
          <div className="flex justify-center space-x-4 mb-2">
            <span>Tab to restart</span>
          </div>
          <p>&copy; 2024 ጦጣtype. Built with React & Tailwind.</p>
        </footer>
      </div>
    </>
  );
}

export default App;