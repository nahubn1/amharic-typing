import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsProps {
    wpm: number;
    accuracy: number;
    history: { time: number; wpm: number; raw: number; errors: number }[];
    charStats: { correct: number; incorrect: number; extra: number; missed: number };
    consistency: number;
    raw: number;
    time: number;
    onRestart: () => void;
    language: string;
}

const Results: React.FC<ResultsProps> = ({ wpm, accuracy, history, charStats, consistency, raw, time, onRestart, language }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full px-0 md:px-8 space-y-12 mt-10 min-h-[60vh]"
        >
            {/* Top Section: Stats & Chart */}
            <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr] gap-12 h-auto lg:h-64">
                {/* Left: WPM & Acc */}
                <div className="flex flex-row lg:flex-col justify-between lg:justify-center space-x-8 lg:space-x-0 space-y-0 lg:space-y-8 min-w-[200px]">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-3xl font-medium">wpm</span>
                        <span className="text-8xl font-bold text-yellow-600 dark:text-yellow-400 leading-none">{wpm}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-3xl font-medium">acc</span>
                        <span className="text-8xl font-bold text-yellow-600 dark:text-yellow-400 leading-none">{accuracy}%</span>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="w-full h-64 lg:h-full bg-gray-200 dark:bg-[#2c2e31] rounded-lg p-4 relative transition-colors duration-300">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#888" vertical={false} />
                            <XAxis dataKey="time" stroke="#888" tick={{ fill: '#888' }} />
                            <YAxis stroke="#888" tick={{ fill: '#888' }} domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#323437', border: 'none', borderRadius: '4px' }}
                                itemStyle={{ color: '#e2b714' }}
                            />
                            <Line type="monotone" dataKey="wpm" stroke="#e2b714" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="raw" stroke="#666" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm mb-1">test type</span>
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl">{language}</span>
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">standard</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm mb-1">raw</span>
                    <span className="text-yellow-600 dark:text-yellow-400 text-3xl font-bold">{raw}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm mb-1">characters</span>
                    <span className="text-xl font-mono">
                        <span className="text-gray-400 dark:text-gray-300">{charStats.correct}</span>/
                        <span className="text-red-500">{charStats.incorrect}</span>/
                        <span className="text-gray-500">{charStats.extra}</span>/
                        <span className="text-gray-500">{charStats.missed}</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm mb-1">consistency</span>
                    <span className="text-yellow-600 dark:text-yellow-400 text-3xl font-bold">{consistency}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm mb-1">time</span>
                    <span className="text-yellow-600 dark:text-yellow-400 text-3xl font-bold">{time}s</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-8 mt-8">
                <button
                    onClick={onRestart}
                    className="group flex items-center justify-center w-16 h-12 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    title="Restart Test"
                >
                    <RotateCcw size={24} />
                </button>
            </div>
        </motion.div>
    );
};

export default Results;
