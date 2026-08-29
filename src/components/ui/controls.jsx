import React from 'react';

export function SelectField({ label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="field-label">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input cursor-pointer appearance-none bg-[length:16px] bg-[right_0.65rem_center] bg-no-repeat pr-9"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        }}
      >
        {options.map((opt) => {
          const isObj = typeof opt === 'object';
          return (
            <option key={isObj ? opt.value : opt} value={isObj ? opt.value : opt}>
              {isObj ? opt.label : opt}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function TextareaField({ label, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="field-label">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input resize-none leading-relaxed"
      />
    </div>
  );
}

export function RangeField({ label, value, min, max, step = 1, onChange, hint, valueLabel }) {
  return (
    <div>
      {(label || valueLabel) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="field-label mb-0">{label}</span>}
          {valueLabel && (
            <span className="text-xs font-semibold text-primary">{valueLabel}</span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        style={{ accentColor: 'var(--primary)' }}
      />
      {hint && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {hint.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
