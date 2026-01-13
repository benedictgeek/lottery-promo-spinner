import { useState } from 'react';
import { Spinner } from './components/Spinner';

const defaultSegments: any[] = [
  { label: '10% Off', color: '#FF6B6B', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png' }, // gift
  { label: 'Free Shipping', color: '#4ECDC4', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f69a.png' }, // truck
  { label: 'Try Again', color: '#45B7D1', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f504.png' }, // refresh
  { label: '$5 Credit', color: '#96CEB4', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b5.png' }, // money
  { label: '20% Off', color: '#FFEAA7', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' }, // star
  { label: 'Mystery Prize', color: '#DDA0DD', image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2753.png' }, // question
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
