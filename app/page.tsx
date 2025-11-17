'use client';

import { useState, useEffect } from 'react';

type Operation = '+' | '-' | '*' | '/';

interface Settings {
  operations: Operation[];
  minNumber: number;
  maxNumber: number;
  problemCount: number;
}

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  correctAnswer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

type Screen = 'setup' | 'exercise' | 'results';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [settings, setSettings] = useState<Settings>({
    operations: ['+', '-'],
    minNumber: 1,
    maxNumber: 20,
    problemCount: 10,
  });
  const [minNumberInput, setMinNumberInput] = useState('1');
  const [maxNumberInput, setMaxNumberInput] = useState('20');
  const [problemCountInput, setProblemCountInput] = useState('10');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [lastAnswerSubmitted, setLastAnswerSubmitted] = useState(false);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && problems.length > 0) {
      localStorage.setItem('mathProblems', JSON.stringify(problems));
      localStorage.setItem('mathSettings', JSON.stringify(settings));
    }
  }, [problems, settings]);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProblems = localStorage.getItem('mathProblems');
      const savedSettings = localStorage.getItem('mathSettings');

      if (savedProblems) {
        const parsed = JSON.parse(savedProblems);
        if (parsed.length > 0 && parsed.every((p: Problem) => p.isCorrect !== null)) {
          setProblems(parsed);
          setScreen('results');
        }
      }

      if (savedSettings) {
        const loaded = JSON.parse(savedSettings);
        setSettings(loaded);
        setMinNumberInput(loaded.minNumber.toString());
        setMaxNumberInput(loaded.maxNumber.toString());
        setProblemCountInput(loaded.problemCount.toString());
      }
    }
  }, []);

  const generateProblem = (ops: Operation[], min: number, max: number): Problem => {
    const operation = ops[Math.floor(Math.random() * ops.length)];
    let num1: number;
    let num2: number;
    let correctAnswer: number;

    switch (operation) {
      case '+':
        // Result must be between min and max
        correctAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
        // num1 can be from min to correctAnswer
        num1 = Math.floor(Math.random() * (correctAnswer - min + 1)) + min;
        num2 = correctAnswer - num1;
        break;

      case '-':
        // Result must be between min and max
        correctAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
        // num1 must be at least correctAnswer to ensure positive result
        const maxNum1 = Math.min(max, correctAnswer + (max - min));
        num1 = Math.floor(Math.random() * (maxNum1 - correctAnswer + 1)) + correctAnswer;
        num2 = num1 - correctAnswer;
        break;

      case '*':
        // Result must be between min and max
        correctAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
        // Find divisors of the result that are >= min
        const divisors = [];
        for (let i = Math.max(1, min); i <= Math.min(10, correctAnswer); i++) {
          if (correctAnswer % i === 0) {
            const other = correctAnswer / i;
            if (other >= min && other <= 10) {
              divisors.push([i, other]);
            }
          }
        }

        if (divisors.length === 0) {
          // If no valid divisors, regenerate
          return generateProblem(ops, min, max);
        }

        const [factor1, factor2] = divisors[Math.floor(Math.random() * divisors.length)];
        num1 = factor1;
        num2 = factor2;
        break;

      case '/':
        // Result must be between min and max
        correctAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
        // num2 should be small (1-10)
        num2 = Math.floor(Math.random() * Math.min(10, Math.floor(max / Math.max(1, correctAnswer)))) + 1;
        num1 = correctAnswer * num2;
        // Ensure num1 is reasonable
        if (num1 > max * 2 || num1 < min) {
          return generateProblem(ops, min, max);
        }
        break;

      default:
        num1 = min;
        num2 = min;
        correctAnswer = min;
    }

    return {
      num1,
      num2,
      operation,
      correctAnswer,
      userAnswer: '',
      isCorrect: null,
    };
  };

  const startExercise = () => {
    if (settings.operations.length === 0) {
      alert('Vyber alespoň jednu operaci!');
      return;
    }

    const minNum = parseInt(minNumberInput);
    const maxNum = parseInt(maxNumberInput);
    const problemCount = parseInt(problemCountInput);

    if (!minNumberInput || !maxNumberInput || !problemCountInput ||
        isNaN(minNum) || isNaN(maxNum) || isNaN(problemCount)) {
      alert('Vyplň všechna pole!');
      return;
    }

    if (minNum < 0 || maxNum > 100 || minNum >= maxNum) {
      alert('Zkontroluj rozsah čísel!');
      return;
    }

    if (problemCount < 1 || problemCount > 50) {
      alert('Počet příkladů musí být mezi 1 a 50!');
      return;
    }

    // Update settings with parsed values
    const newSettings = {
      ...settings,
      minNumber: minNum,
      maxNumber: maxNum,
      problemCount: problemCount,
    };
    setSettings(newSettings);

    const newProblems = Array.from({ length: problemCount }, () =>
      generateProblem(settings.operations, minNum, maxNum)
    );

    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setCurrentAnswer('');
    setScreen('exercise');
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer === '') {
      alert('Napiš odpověď!');
      return;
    }

    const updatedProblems = [...problems];
    const userAnswerNum = parseInt(currentAnswer);
    updatedProblems[currentProblemIndex].userAnswer = currentAnswer;
    updatedProblems[currentProblemIndex].isCorrect =
      userAnswerNum === updatedProblems[currentProblemIndex].correctAnswer;

    setProblems(updatedProblems);

    // For non-last problems, immediately go to next
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setCurrentAnswer('');
      setLastAnswerSubmitted(false);
    } else {
      // For last problem, show submit button
      setLastAnswerSubmitted(true);
    }
  };

  const handleNextProblem = () => {
    setScreen('results');
  };

  const handleCorrection = (index: number, newAnswer: string) => {
    const updatedProblems = [...problems];
    const userAnswerNum = parseInt(newAnswer);
    updatedProblems[index].userAnswer = newAnswer;
    updatedProblems[index].isCorrect =
      userAnswerNum === updatedProblems[index].correctAnswer;
    setProblems(updatedProblems);
  };

  const startNewExercise = () => {
    setScreen('setup');
    setProblems([]);
    setCurrentProblemIndex(0);
    setCurrentAnswer('');
    setLastAnswerSubmitted(false);
    setMinNumberInput(settings.minNumber.toString());
    setMaxNumberInput(settings.maxNumber.toString());
    setProblemCountInput(settings.problemCount.toString());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mathProblems');
    }
  };

  const getOperationSymbol = (op: Operation): string => {
    switch (op) {
      case '+': return '+';
      case '-': return '-';
      case '*': return '×';
      case '/': return '÷';
    }
  };

  const getOperationName = (op: Operation): string => {
    switch (op) {
      case '+': return 'Sčítání';
      case '-': return 'Odčítání';
      case '*': return 'Násobení';
      case '/': return 'Dělení';
    }
  };

  const toggleOperation = (op: Operation) => {
    if (settings.operations.includes(op)) {
      setSettings({
        ...settings,
        operations: settings.operations.filter(o => o !== op),
      });
    } else {
      setSettings({
        ...settings,
        operations: [...settings.operations, op],
      });
    }
  };

  const correctCount = problems.filter(p => p.isCorrect).length;
  const totalCount = problems.length;
  const hasIncorrect = correctCount < totalCount;

  return (
    <div className="flex justify-center p-2 sm:p-3">
      <div className="chalkboard-card max-w-2xl w-full h-fit">

        {screen === 'setup' && (
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-center chalk-text mb-2">
              📚 Procvičování matematiky
            </h1>

            <div>
              <h2 className="text-lg sm:text-xl chalk-text mb-2">Co budeme počítat?</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['+', '-', '*', '/'] as Operation[]).map(op => (
                  <label key={op} className="checkbox-container">
                    <input
                      type="checkbox"
                      className="checkbox-chalk"
                      checked={settings.operations.includes(op)}
                      onChange={() => toggleOperation(op)}
                    />
                    <span className="text-base sm:text-lg chalk-text font-bold">
                      {getOperationSymbol(op)} {getOperationName(op)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm sm:text-base chalk-text mb-1">
                  Od čísla:
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-chalk text-lg sm:text-xl"
                  value={minNumberInput}
                  onChange={(e) => setMinNumberInput(e.target.value)}
                  min="0"
                  max="99"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base chalk-text mb-1">
                  Do čísla:
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-chalk text-lg sm:text-xl"
                  value={maxNumberInput}
                  onChange={(e) => setMaxNumberInput(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base chalk-text mb-1">
                Počet příkladů:
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-chalk text-lg sm:text-xl"
                value={problemCountInput}
                onChange={(e) => setProblemCountInput(e.target.value)}
                min="1"
                max="50"
              />
            </div>

            <button
              className="btn-chalk w-full text-base sm:text-lg"
              onClick={startExercise}
            >
              🚀 Začít cvičení
            </button>
          </div>
        )}

        {screen === 'exercise' && problems[currentProblemIndex] && (
          <div className="space-y-4 screen-fade-in">
            <div className="text-center">
              <div className="text-base sm:text-lg chalk-text mb-2">
                Příklad {currentProblemIndex + 1} z {problems.length}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentProblemIndex + 1) / problems.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div key={currentProblemIndex} className="text-center py-4 problem-slide-in">
              <div className="text-5xl sm:text-6xl chalk-text font-bold mb-6">
                {problems[currentProblemIndex].num1}{' '}
                {getOperationSymbol(problems[currentProblemIndex].operation)}{' '}
                {problems[currentProblemIndex].num2} = ?
              </div>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-chalk text-3xl sm:text-4xl mb-4"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (!lastAnswerSubmitted) {
                      handleSubmitAnswer();
                    } else {
                      handleNextProblem();
                    }
                  }
                }}
                autoFocus
                placeholder="?"
                disabled={lastAnswerSubmitted}
              />

              {!lastAnswerSubmitted ? (
                <button
                  className="btn-chalk w-full text-base sm:text-lg"
                  onClick={handleSubmitAnswer}
                >
                  {currentProblemIndex < problems.length - 1 ? '✓ Zadat a další' : '✓ Zadat výsledek'}
                </button>
              ) : (
                <button
                  className="btn-chalk w-full text-base sm:text-lg"
                  onClick={handleNextProblem}
                >
                  🏁 Zkontrolovat výsledky
                </button>
              )}
            </div>
          </div>
        )}

        {screen === 'results' && (
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-center chalk-text mb-2">
              {hasIncorrect ? '✏️ Oprav chyby' : '🎉 Výsledky'}
            </h1>

            <div className="text-center bg-white bg-opacity-10 rounded-xl p-3">
              <div className="text-3xl sm:text-4xl chalk-text font-bold mb-1">
                {correctCount} / {totalCount}
              </div>
              <div className="text-xs sm:text-sm chalk-text mb-2">správně</div>
              <div className="text-base sm:text-lg chalk-text">
                {correctCount === totalCount
                  ? '🌟 Výborně! Všechno správně! 🌟'
                  : '✏️ Oprav nesprávné odpovědi níže'}
              </div>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className={`result-card ${
                    problem.isCorrect
                      ? 'result-card-correct'
                      : 'result-card-incorrect'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-lg sm:text-xl chalk-text font-bold flex-1">
                      {problem.num1} {getOperationSymbol(problem.operation)}{' '}
                      {problem.num2} ={' '}
                      {!problem.isCorrect ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="input-chalk w-16 sm:w-20 inline-block text-lg py-1.5"
                          value={problem.userAnswer}
                          onChange={(e) => handleCorrection(index, e.target.value)}
                          autoFocus={index === problems.findIndex(p => !p.isCorrect)}
                        />
                      ) : (
                        <span className="text-green-300">
                          {problem.userAnswer}
                        </span>
                      )}
                    </div>
                    <div className={`text-2xl sm:text-3xl font-bold flex-shrink-0 ${problem.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      {problem.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {hasIncorrect ? (
                <div className="text-center text-sm sm:text-base chalk-text bg-white bg-opacity-10 rounded-lg p-2">
                  Oprav všechny chyby, aby ses mohl posunout dál
                </div>
              ) : (
                <button
                  className="btn-chalk w-full text-sm sm:text-base"
                  onClick={startNewExercise}
                >
                  🆕 Nové cvičení
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
