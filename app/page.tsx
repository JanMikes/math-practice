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
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [correctionMode, setCorrectionMode] = useState(false);
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
        setSettings(JSON.parse(savedSettings));
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

    if (settings.minNumber < 0 || settings.maxNumber > 100 || settings.minNumber >= settings.maxNumber) {
      alert('Zkontroluj rozsah čísel!');
      return;
    }

    if (settings.problemCount < 1 || settings.problemCount > 50) {
      alert('Počet příkladů musí být mezi 1 a 50!');
      return;
    }

    const newProblems = Array.from({ length: settings.problemCount }, () =>
      generateProblem(settings.operations, settings.minNumber, settings.maxNumber)
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
    setLastAnswerSubmitted(true);
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setCurrentAnswer('');
      setLastAnswerSubmitted(false);
    } else {
      setScreen('results');
    }
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
    setCorrectionMode(false);
    setLastAnswerSubmitted(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mathProblems');
    }
  };

  const retryIncorrect = () => {
    const incorrectProblems = problems.filter(p => !p.isCorrect);
    incorrectProblems.forEach(p => {
      p.userAnswer = '';
      p.isCorrect = null;
    });
    setProblems(incorrectProblems);
    setCurrentProblemIndex(0);
    setCurrentAnswer('');
    setScreen('exercise');
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

  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="chalkboard-card max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">

        {screen === 'setup' && (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center chalk-text mb-4">
              📚 Procvičování matematiky
            </h1>

            <div>
              <h2 className="text-xl md:text-2xl chalk-text mb-3">Co budeme počítat?</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['+', '-', '*', '/'] as Operation[]).map(op => (
                  <label key={op} className="checkbox-container">
                    <input
                      type="checkbox"
                      className="checkbox-chalk"
                      checked={settings.operations.includes(op)}
                      onChange={() => toggleOperation(op)}
                    />
                    <span className="text-xl chalk-text font-bold">
                      {getOperationSymbol(op)} {getOperationName(op)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-lg chalk-text mb-2">
                  Od čísla:
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-chalk text-lg"
                  value={settings.minNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, minNumber: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="99"
                />
              </div>
              <div>
                <label className="block text-lg chalk-text mb-2">
                  Do čísla:
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-chalk text-lg"
                  value={settings.maxNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, maxNumber: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg chalk-text mb-2">
                Počet příkladů:
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-chalk text-lg"
                value={settings.problemCount}
                onChange={(e) =>
                  setSettings({ ...settings, problemCount: parseInt(e.target.value) || 1 })
                }
                min="1"
                max="50"
              />
            </div>

            <button
              className="btn-chalk w-full text-2xl"
              onClick={startExercise}
            >
              🚀 Začít cvičení
            </button>
          </div>
        )}

        {screen === 'exercise' && problems[currentProblemIndex] && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <div className="text-lg md:text-xl chalk-text mb-2">
                Příklad {currentProblemIndex + 1} z {problems.length}
              </div>
              <div className="w-full bg-chalkboard-dark rounded-full h-3">
                <div
                  className="bg-chalk-yellow h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentProblemIndex + 1) / problems.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl md:text-6xl chalk-text font-bold mb-6 md:mb-8 py-4 md:py-8">
                {problems[currentProblemIndex].num1}{' '}
                {getOperationSymbol(problems[currentProblemIndex].operation)}{' '}
                {problems[currentProblemIndex].num2} = ?
              </div>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-chalk text-3xl md:text-4xl mb-4 md:mb-6"
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
                  className="btn-chalk w-full text-2xl"
                  onClick={handleSubmitAnswer}
                >
                  ✓ Zadat výsledek
                </button>
              ) : (
                <button
                  className="btn-chalk w-full text-2xl"
                  onClick={handleNextProblem}
                >
                  {currentProblemIndex < problems.length - 1 ? '➡️ Další příklad' : '🏁 Zkontrolovat výsledky'}
                </button>
              )}
            </div>
          </div>
        )}

        {screen === 'results' && (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center chalk-text mb-2">
              🎉 Výsledky
            </h1>

            <div className="text-center">
              <div className="text-2xl md:text-3xl chalk-text font-bold mb-2">
                {correctCount} / {totalCount} správně
              </div>
              <div className="text-lg md:text-xl chalk-text">
                {correctCount === totalCount
                  ? '🌟 Výborně! Všechno správně! 🌟'
                  : correctCount >= totalCount * 0.8
                  ? '👏 Skvělá práce!'
                  : correctCount >= totalCount * 0.6
                  ? '👍 Dobře, ale můžeš to ještě lépe!'
                  : '💪 Nezapomeň se víc procvičit!'}
              </div>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    problem.isCorrect
                      ? 'bg-green-900 bg-opacity-40 border-2 border-chalk-green'
                      : 'bg-red-900 bg-opacity-40 border-2 border-chalk-red'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg md:text-2xl chalk-text font-bold">
                      {problem.num1} {getOperationSymbol(problem.operation)}{' '}
                      {problem.num2} ={' '}
                      {correctionMode && !problem.isCorrect ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="input-chalk w-20 md:w-24 inline-block text-lg md:text-xl"
                          value={problem.userAnswer}
                          onChange={(e) => handleCorrection(index, e.target.value)}
                        />
                      ) : (
                        <span
                          className={
                            problem.isCorrect ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {problem.userAnswer}
                        </span>
                      )}
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold ${problem.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {problem.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {!correctionMode && correctCount < totalCount && (
                <button
                  className="btn-chalk w-full text-lg md:text-xl"
                  onClick={() => setCorrectionMode(true)}
                >
                  ✏️ Opravit nesprávné odpovědi
                </button>
              )}
              {correctionMode && (
                <button
                  className="btn-chalk w-full text-lg md:text-xl bg-green-600 hover:bg-green-700"
                  onClick={() => setCorrectionMode(false)}
                >
                  💾 Uložit opravy
                </button>
              )}
              {correctCount < totalCount && (
                <button
                  className="btn-chalk w-full text-lg md:text-xl bg-orange-500 hover:bg-orange-600"
                  onClick={retryIncorrect}
                >
                  🔄 Opakovat nesprávné příklady
                </button>
              )}
              <button
                className="btn-chalk w-full text-lg md:text-xl"
                onClick={startNewExercise}
              >
                🆕 Nové cvičení
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
