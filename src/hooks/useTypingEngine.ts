import { useState, useEffect, useCallback, useRef } from 'react';

export interface TypingState {
    text: string;
    userInput: string;
    startTime: number | null;
    endTime: number | null;
    wpm: number;
    accuracy: number;
    isFinished: boolean;
    currIndex: number;
    timeLeft: number;
    history: { time: number; wpm: number; raw: number; errors: number }[];
    charStats: { correct: number; incorrect: number; extra: number; missed: number };
    consistency: number;
}

export const useTypingEngine = (initialText: string, mode: 'time' | 'words', configValue: number) => {
    const [text, setText] = useState(initialText);
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(mode === 'time' ? configValue : 0);
    const [history, setHistory] = useState<{ time: number; wpm: number; raw: number; errors: number }[]>([]);

    const timerRef = useRef<number | null>(null);
    const historyTimerRef = useRef<number | null>(null);

    const reset = useCallback((newText: string) => {
        setText(newText);
        setUserInput('');
        setStartTime(null);
        setEndTime(null);
        setIsFinished(false);
        setTimeLeft(mode === 'time' ? configValue : 0);
        setHistory([]);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (historyTimerRef.current) {
            clearInterval(historyTimerRef.current);
            historyTimerRef.current = null;
        }
    }, [mode, configValue]);

    // Timer logic for 'time' mode
    useEffect(() => {
        if (mode === 'time' && startTime && !isFinished) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsFinished(true);
                        setEndTime(Date.now());
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTime, isFinished, mode]);

    // History tracking
    useEffect(() => {
        if (startTime && !isFinished) {
            historyTimerRef.current = window.setInterval(() => {
                const timeElapsed = (Date.now() - startTime) / 60000;
                // Prevent division by zero or extremely small numbers
                const effectiveTime = Math.max(timeElapsed, 0.0001);

                const wordsTyped = userInput.length / 5;
                const wpm = Math.round(wordsTyped / effectiveTime);
                const raw = Math.round((userInput.length / 5) / effectiveTime);

                let errors = 0;
                for (let i = 0; i < userInput.length; i++) {
                    if (userInput[i] !== text[i]) errors++;
                }

                setHistory(prev => {
                    // Avoid duplicate entries for the same second
                    const lastEntry = prev[prev.length - 1];
                    const currentTime = Math.round((Date.now() - startTime) / 1000);

                    if (lastEntry && lastEntry.time === currentTime) {
                        return prev;
                    }

                    return [...prev, {
                        time: currentTime,
                        wpm,
                        raw,
                        errors
                    }];
                });
            }, 1000);
        }
        return () => {
            if (historyTimerRef.current) clearInterval(historyTimerRef.current);
        };
    }, [startTime, isFinished, userInput, text]);

    // Ensure we have at least one history point when finishing
    useEffect(() => {
        if (isFinished && startTime) {
            const timeElapsed = (Date.now() - startTime) / 60000;
            const effectiveTime = Math.max(timeElapsed, 0.0001);
            const wordsTyped = userInput.length / 5;
            const wpm = Math.round(wordsTyped / effectiveTime);
            const raw = Math.round((userInput.length / 5) / effectiveTime);

            let errors = 0;
            for (let i = 0; i < userInput.length; i++) {
                if (userInput[i] !== text[i]) errors++;
            }

            setHistory(prev => {
                if (prev.length === 0) {
                    return [{
                        time: 1,
                        wpm,
                        raw,
                        errors
                    }];
                }
                return prev;
            });
        }
    }, [isFinished, startTime, userInput, text]);

    const handleInput = useCallback((input: string) => {
        if (isFinished) return;

        if (!startTime) {
            setStartTime(Date.now());
        }

        setUserInput(input);

        if (mode === 'words' && input.length === text.length) {
            setEndTime(Date.now());
            setIsFinished(true);
        }
    }, [isFinished, startTime, text, mode]);

    const calculateStats = useCallback(() => {
        if (!startTime) return {
            wpm: 0,
            accuracy: 0,
            history: [],
            charStats: { correct: 0, incorrect: 0, extra: 0, missed: 0 },
            consistency: 0,
            raw: 0,
            time: 0
        };

        const now = endTime || Date.now();
        const timeElapsed = mode === 'time'
            ? (configValue - timeLeft) / 60
            : (now - startTime) / 60000;

        // Ensure we have a valid time elapsed, minimum 1 second to avoid huge WPM
        const effectiveTime = Math.max(timeElapsed, 1 / 60);

        const wordsTyped = userInput.length / 5;
        const wpm = Math.round(wordsTyped / effectiveTime);
        const raw = Math.round((userInput.length / 5) / effectiveTime);

        let correctChars = 0;
        let incorrectChars = 0;
        let extraChars = 0;
        let missedChars = 0;

        for (let i = 0; i < userInput.length; i++) {
            if (i < text.length) {
                if (userInput[i] === text[i]) {
                    correctChars++;
                } else {
                    incorrectChars++;
                }
            } else {
                extraChars++;
            }
        }
        missedChars = Math.max(0, text.length - userInput.length);

        const accuracy = userInput.length > 0
            ? Math.round((correctChars / userInput.length) * 100)
            : 0;

        // Consistency calculation (Coefficient of Variation)
        const wpmValues = history.map(h => h.wpm);
        let consistency = 100;
        if (wpmValues.length > 0) {
            const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
            const variance = wpmValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmValues.length;
            const stdDev = Math.sqrt(variance);
            // Consistency is 100 - CV. If mean is 0, consistency is 100 (perfectly consistent at 0 wpm)
            consistency = mean === 0 ? 100 : Math.round(100 - ((stdDev / mean) * 100));
            // Clamp consistency between 0 and 100
            consistency = Math.max(0, Math.min(100, consistency));
        }

        return {
            wpm,
            accuracy,
            history,
            charStats: { correct: correctChars, incorrect: incorrectChars, extra: extraChars, missed: missedChars },
            consistency,
            raw,
            time: Math.round(effectiveTime * 60)
        };
    }, [endTime, startTime, userInput, text, mode, configValue, timeLeft, history]);

    return {
        text,
        userInput,
        isFinished,
        timeLeft,
        handleInput,
        reset,
        stats: calculateStats(),
    };
};
