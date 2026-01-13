import { useState } from 'react';
import { Spinner } from './components/Spinner';

const defaultSegments: any[] = [
  { label: '10% Off', color: '#FF6B6B' },
  { label: 'Free Shipping', color: '#4ECDC4' },
  { label: 'Try Again', color: '#45B7D1' },
  { label: '$5 Credit', color: '#96CEB4' },
  { label: '20% Off', color: '#FFEAA7' },
  { label: 'Mystery Prize', color: '#DDA0DD' },
];

function App() {
  const [winner, setWinner] = useState<string | null>(null);

  const handleSpinEnd = (result: { label: string; index: number }) => {
    setWinner(result.label);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">

      <Spinner
        segments={defaultSegments}
        onSpinEnd={handleSpinEnd}
        spinDuration={5000}
        size={350}
      />

      <div className="mt-8 p-4 bg-gray-800 rounded-lg min-w-[200px] text-center">
        <p className="text-xl text-white">
          {winner ? (
            <>You won: <span className="text-yellow-400 font-bold">{winner}</span></>
          ) : (
            <span className="text-gray-500">Spin to play!</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default App;
