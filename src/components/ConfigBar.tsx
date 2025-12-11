import React from 'react';
import { Clock, Type, Globe } from 'lucide-react';
import type { Language } from '../utils/textGenerator';

export type Mode = 'time' | 'words';
export type Theme = 'dark' | 'light';

interface ConfigBarProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    configValue: number;
    setConfigValue: (value: number) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const ConfigBar: React.FC<ConfigBarProps> = ({
    mode, setMode,
    configValue, setConfigValue,
    language, setLanguage
}) => {
    const timeOptions = [15, 30, 60, 120];
    const wordOptions = [10, 25, 50, 100];

    return (
        <div className="flex items-center space-x-4 mb-6 p-3 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm w-fit mx-auto transition-all duration-300">
            {/* Language Toggle */}
            <button
                onClick={() => setLanguage(language === 'amharic' ? 'english' : 'amharic')}
                className="flex items-center space-x-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-300 text-gray-600 dark:text-gray-500 text-sm"
            >
                <Globe size={14} />
                <span className={language === 'amharic' ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                    {language === 'amharic' ? 'amharic' : 'english'}
                </span>
            </button>



            {/* Mode: Time */}
            <button
                onClick={() => setMode('time')}
                className={`flex items-center space-x-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-300 text-sm ${mode === 'time' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-500'}`}
            >
                <Clock size={14} />
                <span>time</span>
            </button>

            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>

            {/* Mode: Words */}
            <button
                onClick={() => setMode('words')}
                className={`flex items-center space-x-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-300 text-sm ${mode === 'words' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-500'}`}
            >
                <Type size={14} />
                <span>words</span>
            </button>

            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>

            {/* Value Options */}
            <div className="flex space-x-3">
                {(mode === 'time' ? timeOptions : wordOptions).map((val) => (
                    <button
                        key={val}
                        onClick={() => setConfigValue(val)}
                        className={`px-2 py-0.5 rounded transition-colors text-sm ${configValue === val
                            ? 'text-yellow-600 dark:text-yellow-400 font-bold'
                            : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        {val}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ConfigBar;
