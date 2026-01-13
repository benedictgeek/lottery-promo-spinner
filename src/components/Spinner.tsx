import { useState, useRef, useCallback, useEffect } from 'react';
import { useClickSound } from '../hooks/useAudio';
import pointerPinSvg from '../svg/pointer-pin.svg';

export interface Segment {
  label: string;
  color: string;
}

interface SpinnerProps {
  segments: Segment[];
  onSpinEnd?: (winner: { label: string; index: number }) => void;
  spinDuration?: number;
  size?: number;
}

export function Spinner({
  segments,
  onSpinEnd,
  spinDuration = 5000,
  size = 400,
}: SpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pointerAngle, setPointerAngle] = useState(0);
  const lastSegmentIndexRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const pointerAnimationRef = useRef<number | null>(null);
  const { playClick } = useClickSound();

  // Animate pointer bounce
  const bouncePointer = useCallback(() => {
    if (pointerAnimationRef.current) {
      cancelAnimationFrame(pointerAnimationRef.current);
    }

    const startTime = performance.now();
    const duration = 150;
    const maxAngle = 15;

    const animatePointer = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Spring-like bounce: quick deflection then return
      const angle = maxAngle * Math.sin(progress * Math.PI) * (1 - progress);
      setPointerAngle(angle);

      if (progress < 1) {
        pointerAnimationRef.current = requestAnimationFrame(animatePointer);
      } else {
        setPointerAngle(0);
      }
    };

    pointerAnimationRef.current = requestAnimationFrame(animatePointer);
  }, []);

  const segmentAngle = 360 / segments.length;
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pointerAnimationRef.current) {
        cancelAnimationFrame(pointerAnimationRef.current);
      }
    };
  }, []);

  // Inner radius for segments (accounting for outer ring)
  const innerRadius = radius - 15;

  // Create SVG arc path for a segment
  const createSegmentPath = (index: number): string => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + innerRadius * Math.cos(endAngle);
    const y2 = centerY + innerRadius * Math.sin(endAngle);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate text position for a segment
  const getTextPosition = (index: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180);
    const textRadius = innerRadius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle),
      rotation: (index + 0.5) * segmentAngle,
    };
  };

  // Easing function: ease-out cubic
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Spin the wheel
  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);

    // Calculate random final rotation (4-8 full rotations + random segment)
    const extraRotations = 4 + Math.random() * 4;
    const randomSegmentOffset = Math.random() * 360;
    const totalRotation = rotation + extraRotations * 360 + randomSegmentOffset;

    const startTime = performance.now();
    const startRotation = rotation;
    const rotationDelta = totalRotation - startRotation;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentRotation = startRotation + rotationDelta * easedProgress;
      setRotation(currentRotation);

      // Check for segment boundary crossing (play click)
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      const currentSegmentIndex = Math.floor(normalizedRotation / segmentAngle);

      if (currentSegmentIndex !== lastSegmentIndexRef.current) {
        playClick();
        bouncePointer();
        lastSegmentIndexRef.current = currentSegmentIndex;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Spin complete - determine winner
        setIsSpinning(false);

        // The pointer is at the top (0 degrees / 360 degrees)
        // We need to find which segment is at the pointer position
        const finalRotation = ((totalRotation % 360) + 360) % 360;
        // Pointer at top means we check what's at 360 - rotation (or equivalently, -rotation)
        const pointerAngle = ((360 - finalRotation) % 360 + 360) % 360;
        const winnerIndex = Math.floor(pointerAngle / segmentAngle);

        if (onSpinEnd) {
          onSpinEnd({
            label: segments[winnerIndex].label,
            index: winnerIndex,
          });
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, rotation, segments, segmentAngle, spinDuration, playClick, bouncePointer, onSpinEnd]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Spinner container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer */}
        <div
          className="absolute left-1/2 z-10"
          style={{
            top: -20,
            transformOrigin: 'center top',
            transform: `translateX(-50%) rotate(${pointerAngle}deg)`,
          }}
        >
          <img
            src={pointerPinSvg}
            alt="pointer"
            className="drop-shadow-lg"
            style={{ width: 40, height: 40 }}
          />
        </div>

        {/* Wheel */}
        <svg
          width={size}
          height={size}
          className="cursor-pointer drop-shadow-2xl"
          onClick={spin}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="innerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="50%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - 5}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="10"
          />

          {/* Inner border */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - 12}
            fill="none"
            stroke="url(#innerRingGradient)"
            strokeWidth="4"
          />

          {/* Decorative pegs/notches around the ring */}
          {segments.map((_, index) => {
            const angle = (index * segmentAngle - 90) * (Math.PI / 180);
            const pegX = centerX + (radius - 5) * Math.cos(angle);
            const pegY = centerY + (radius - 5) * Math.sin(angle);
            return (
              <circle
                key={`peg-${index}`}
                cx={pegX}
                cy={pegY}
                r={4}
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="1"
              />
            );
          })}

          {/* Segments */}
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={createSegmentPath(index)}
                fill={segment.color}
                stroke="#1f2937"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Text labels */}
          {segments.map((segment, index) => {
            const pos = getTextPosition(index);
            return (
              <text
                key={`text-${index}`}
                x={pos.x}
                y={pos.y}
                fill="white"
                fontSize={Math.max(12, size / 25)}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}
                transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
              >
                {segment.label}
              </text>
            );
          })}

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.15}
            fill="#1f2937"
            stroke="#374151"
            strokeWidth="3"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.08}
            fill="#4b5563"
          />
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`
          px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200
          ${isSpinning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95'
          }
        `}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
    </div>
  );
}
