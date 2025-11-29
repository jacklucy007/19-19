import React from 'react';

interface KeypadProps {
  onInput: (num: number) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled: boolean;
}

const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onClear, onSubmit, disabled }) => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-3 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      {/* Numbers 1-9 */}
      {keys.map((num) => (
        <button
          key={num}
          onClick={() => onInput(num)}
          disabled={disabled}
          className="
            h-14 sm:h-16 text-2xl font-bold rounded-xl transition-all duration-100
            bg-slate-700/80 hover:bg-cyan-600 active:scale-95 text-white
            shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1
            disabled:opacity-50 disabled:cursor-not-allowed
            font-sci-fi
          "
        >
          {num}
        </button>
      ))}

      {/* Row 4: Clear, 0, Delete */}
      <button
        onClick={onClear}
        disabled={disabled}
        className="h-14 sm:h-16 text-xl font-bold rounded-xl bg-yellow-600/80 hover:bg-yellow-500 active:scale-95 text-white shadow-lg border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all"
      >
        C
      </button>

      <button
        onClick={() => onInput(0)}
        disabled={disabled}
        className="
          h-14 sm:h-16 text-2xl font-bold rounded-xl transition-all duration-100
          bg-slate-700/80 hover:bg-cyan-600 active:scale-95 text-white
          shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1
          disabled:opacity-50 disabled:cursor-not-allowed
          font-sci-fi
        "
      >
        0
      </button>

      <button
        onClick={onDelete}
        disabled={disabled}
        className="h-14 sm:h-16 text-xl font-bold rounded-xl bg-rose-600/80 hover:bg-rose-500 active:scale-95 text-white shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all"
      >
        ⌫
      </button>

      {/* Row 5: Submit (Full Width) */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="col-span-3 h-16 text-2xl font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all mt-1"
      >
        发射 (FIRE)
      </button>
    </div>
  );
};

export default Keypad;