import React, { useRef, useEffect, useState } from 'react';

interface TypingAreaProps {
    text: string;
    userInput: string;
    isFinished: boolean;
    onInput: (input: string) => void;
    mode: 'time' | 'words';
    timeLeft?: number;
    wordsTyped?: number;
    totalWords?: number;
}

const TypingArea: React.FC<TypingAreaProps> = ({
    text,
    userInput,
    isFinished,
    onInput,
    mode,
    timeLeft,
    wordsTyped = 0,
    totalWords = 0
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const wordsContainerRef = useRef<HTMLDivElement>(null);
    const [wordRows, setWordRows] = useState<number[]>([]);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [rowHeight, setRowHeight] = useState(0);

    useEffect(() => {
        if (!isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFinished]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInput(e.target.value);
    };

    const handleBlur = () => {
        if (!isFinished && inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Split text into words
    const words = text.split(' ');

    // Parse user input to determine completed words vs current word
    const endsWithSpace = userInput.endsWith(' ');
    const allInputWords = userInput.split(' ');

    const typedWords = endsWithSpace
        ? allInputWords.filter(w => w.length > 0)
        : allInputWords.slice(0, -1).filter(w => w.length > 0);

    const currentWord = endsWithSpace ? '' : (allInputWords[allInputWords.length - 1] || '');
    const currentWordIndex = typedWords.length;

    // Measure word positions and assign them to rows
    useEffect(() => {
        if (!wordsContainerRef.current) return;

        const wordElements = wordsContainerRef.current.querySelectorAll('[data-word-index]');
        if (wordElements.length === 0) return;

        const positions: { index: number; top: number }[] = [];
        wordElements.forEach((el) => {
            const index = parseInt(el.getAttribute('data-word-index') || '0');
            const rect = el.getBoundingClientRect();
            const containerRect = wordsContainerRef.current!.getBoundingClientRect();
            positions.push({ index, top: rect.top - containerRect.top });
        });

        // Group words by rows based on Y position
        const rows: number[] = new Array(words.length).fill(0);
        let currentRow = 0;
        let lastTop = positions[0]?.top || 0;
        const threshold = 10; // pixels tolerance for same row

        positions.forEach(({ index, top }) => {
            if (Math.abs(top - lastTop) > threshold) {
                currentRow++;
                lastTop = top;
            }
            rows[index] = currentRow;
        });

        setWordRows(rows);

        // Calculate row height
        if (positions.length > 1) {
            const firstRowTop = positions[0].top;
            const secondRowElement = positions.find(p => Math.abs(p.top - firstRowTop) > threshold);
            if (secondRowElement) {
                setRowHeight(Math.abs(secondRowElement.top - firstRowTop));
            }
        }
    }, [text, words.length]);

    // Check if user completed a word on row 2 or higher and trigger scroll
    useEffect(() => {
        if (typedWords.length === 0 || wordRows.length === 0 || !rowHeight) return;

        const lastTypedWordIndex = typedWords.length - 1;
        const lastTypedWordRow = wordRows[lastTypedWordIndex];

        // If user is on row 2 or higher, scroll up
        if (lastTypedWordRow >= 2) {
            const rowsToScroll = lastTypedWordRow - 1; // Keep user on row 1
            setScrollOffset(-rowsToScroll * rowHeight);
        }
    }, [typedWords.length, wordRows, rowHeight]);

    return (
        <div className="relative w-full max-w-6xl mx-auto">
            {/* Counter in top-left */}
            <div className="absolute -top-10 left-0 text-yellow-600 dark:text-yellow-400 text-xl font-bold">
                {mode === 'time' ? (
                    <span>{timeLeft}s</span>
                ) : (
                    <span>{wordsTyped}/{totalWords}</span>
                )}
            </div>

            {/* Typing Area Container - 3 rows max */}
            <div
                className="relative w-full p-2 font-mono text-4xl leading-[1.8] outline-none overflow-hidden"
                style={{ maxHeight: 'calc(1.8em * 3)' }}
                onClick={() => inputRef.current?.focus()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="absolute opacity-0 w-full h-full cursor-default"
                    value={userInput}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoFocus
                />

                {/* Word-based rendering with scroll */}
                <div
                    ref={wordsContainerRef}
                    className="select-none pointer-events-none transition-transform duration-300 ease-out"
                    style={{ transform: `translateY(${scrollOffset}px)` }}
                >
                    <div className="flex flex-wrap gap-x-3">
                        {words.map((word, wordIndex) => {
                            let wordColor = 'text-gray-400 dark:text-gray-500';

                            if (wordIndex < typedWords.length) {
                                // Word has been completed
                                if (typedWords[wordIndex] === word) {
                                    wordColor = 'text-gray-800 dark:text-white';
                                } else {
                                    wordColor = 'underline decoration-red-500 decoration-2 underline-offset-4';

                                    // Render character by character for incorrect words to show specific errors
                                    return (
                                        <span key={wordIndex} data-word-index={wordIndex} className={`${wordColor} whitespace-nowrap`}>
                                            {word.split('').map((char, charIndex) => {
                                                const typedChar = typedWords[wordIndex][charIndex];
                                                let charColor = 'text-gray-800 dark:text-white';

                                                // If character doesn't match or wasn't typed (missing), mark as red
                                                if (typedChar !== char) {
                                                    charColor = 'text-red-500';
                                                }

                                                return (
                                                    <span key={charIndex} className={charColor}>
                                                        {char}
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    );
                                }
                            } else if (wordIndex === currentWordIndex) {
                                // Currently typing this word - show character-by-character
                                return (
                                    <span key={wordIndex} data-word-index={wordIndex} className="relative inline-block whitespace-nowrap">
                                        {word.split('').map((char, charIndex) => {
                                            let charColor = 'text-gray-400 dark:text-gray-500';

                                            if (charIndex < currentWord.length) {
                                                if (currentWord[charIndex] === char) {
                                                    charColor = 'text-gray-800 dark:text-white';
                                                } else {
                                                    charColor = 'underline decoration-red-500 decoration-2 underline-offset-4 text-gray-800 dark:text-white';
                                                }
                                            }

                                            const isCurrent = charIndex === currentWord.length;

                                            return (
                                                <span key={charIndex} className={`relative ${charColor} transition-colors duration-100`}>
                                                    {isCurrent && !isFinished && (
                                                        <span className="absolute left-0 -top-1 w-1 h-12 bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
                                                    )}
                                                    {char}
                                                </span>
                                            );
                                        })}
                                        {/* Show cursor at end of word if all characters typed correctly */}
                                        {currentWord.length === word.length && !isFinished && (
                                            <span className="absolute -right-0.5 -top-1 w-1 h-12 bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
                                        )}
                                    </span>
                                );
                            }

                            // Not yet typed
                            return (
                                <span key={wordIndex} data-word-index={wordIndex} className={`${wordColor} whitespace-nowrap`}>
                                    {word}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypingArea;
