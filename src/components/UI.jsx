// src/components/UI.js
import React from 'react';

const s = {
  // Layout
  section: {
    background: 'white', borderRadius: 14, padding: 16,
    marginBottom: 14, border: '1px solid #E4E7EC'
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 700, color: '#1D2939',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
  },
  sectionIcon: (bg) => ({
    width: 26, height: 26, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 13,
    background: bg, flexShrink: 0
  }),

  // KPI
  kpiGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  kpiCard: (variant) => ({
    background: variant === 'alert' ? '#FEE4E2' : variant === 'warn' ? '#FEF0E5' : variant === 'ok' ? '#E0F5F1' : 'white',
    borderRadius: 14, padding: 14,
    border: `1px solid ${variant === 'alert' ? '#D92D20' : variant === 'warn' ? '#F4720B' : variant === 'ok' ? '#00917C' : '#E4E7EC'}`
  }),
  kpiLabel: { fontSize: 11, color: '#667085', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' },
  kpiValue: (variant) => ({
    fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace",
    margin: '4px 0', color: variant === 'alert' ? '#D92D20' : variant === 'warn' ? '#F4720B' : variant === 'ok' ? '#00917C' : '#1D2939'
  }),

  // Buttons
  btnPrimary: {
    background: 'linear-gradient(135deg,#0057A8,#3381C8)', color: 'white',
    border: 'none', borderRadius: 10, padding: '12px 20px',
    fontSize: 14, fontWeight: 600, width: '100%', marginTop: 8, cursor: 'pointer'
  },
  btnSecondary: {
    background: 'white', color: '#0057A8', border: '1.5px solid #0057A8',
    borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1
  },
  btnExport: {
    background: '#DCFAE6', color: '#027A48', border: '1.5px solid #027A48',
    borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
  },

  // Form
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: '#344054', textTransform: 'uppercase', letterSpacing: '0.4px' },
  fieldInput: {
    padding: '9px 12px', border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, fontFamily: "'Space Mono', monospace", outline: 'none', background: 'white', width: '100%'
  },
};

export function Section({ icon, iconBg = '#E8F2FF', title, children, style }) {
  return (
    <div style={{ ...s.section, ...style }}>
      {title && (
        <div style={s.sectionTitle}>
          <span style={s.sectionIcon(iconBg)}>{icon}</span>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function KpiCard({ label, value, unit, delta, deltaLabel, variant = 'default' }) {
  const isPos = delta >= 0;
  return (
    <div style={s.kpiCard(variant)}>
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiValue(variant)}>
        {value}
        {unit && <span style={{ fontSize: 12, fontWeight: 400, color: '#667085' }}> {unit}</span>}
      </div>
      {delta !== null && delta !== undefined && (
        <div style={{ fontSize: 12, color: isPos ? '#027A48' : '#D92D20' }}>
          {isPos ? '↑' : '↓'} {Math.abs(delta)} {deltaLabel}
        </div>
      )}
    </div>
  );
}

export function AlertItem({ type, icon, text, sub, site }) {
  const colors = {
    danger: { bg: '#FEE4E2', border: '#D92D20' },
    warning: { bg: '#FEF0E5', border: '#F4720B' },
    info: { bg: '#E8F2FF', border: '#0057A8' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10,
      borderRadius: 10, marginBottom: 8, background: c.bg, borderLeft: `4px solid ${c.border}`
    }}>
      <span style={{ fontSize: 16, marginTop: 1 }}>{icon}</span>
      <div>
        {site && <div style={{ fontSize: 10, color: '#667085', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>{site}</div>}
        <div style={{ fontSize: 13, color: '#1D2939', fontWeight: 500 }}>{text}</div>
        <div style={{ fontSize: 11, color: '#667085', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

export function FuelBar({ value }) {
  const cls = value < 10 ? '#D92D20' : value < 20 ? '#F4720B' : '#027A48';
  return (
    <div>
      <div style={{
        height: 20, borderRadius: 10, background: '#F9FAFB',
        overflow: 'hidden', marginTop: 6
      }}>
        <div style={{
          height: '100%', width: `${Math.min(100, value)}%`, borderRadius: 10,
          background: `linear-gradient(90deg, ${cls}, ${cls}99)`,
          transition: 'width 0.5s'
        }} />
      </div>
    </div>
  );
}

export function SiteSelector({ sites, current, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
      {sites.map((site, i) => (
        <button
          key={site.id}
          onClick={() => onSelect(i)}
          style={{
            padding: '8px 14px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
            border: i === current ? 'none' : '1.5px solid #E4E7EC',
            background: i === current ? 'linear-gradient(135deg,#0057A8,#3381C8)' : 'white',
            color: i === current ? 'white' : '#1D2939',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: i === current ? '0 4px 12px rgba(0,87,168,0.25)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: i === current ? 'rgba(255,255,255,0.7)' :
              site.status === 'warn' ? '#F4720B' : '#027A48'
          }} />
          {site.name}
        </button>
      ))}
    </div>
  );
}

export function FieldInput({ label, id, type = 'text', value, onChange, placeholder, min, max, step, style }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{ ...s.fieldInput, ...style }}
      />
    </div>
  );
}

export function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '80px'})`,
      background: '#1D2939', color: 'white', padding: '10px 20px',
      borderRadius: 10, fontSize: 13, fontWeight: 500,
      transition: 'transform 0.3s', zIndex: 999, whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      {message}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', zIndex: 200
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '20px 20px 0 0',
          padding: 24, width: '100%', maxHeight: '80vh', overflowY: 'auto'
        }}
      >
        <div style={{ width: 36, height: 4, background: '#E4E7EC', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export { s };
