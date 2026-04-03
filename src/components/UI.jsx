import React from 'react';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  blue: '#0057A8', blueDark: '#003d7a', blueMid: '#3381C8', blueLight: '#EBF3FF',
  teal: '#00917C', tealLight: '#E0F5F1',
  orange: '#F4720B', orangeLight: '#FFF4EC',
  red: '#D92D20', redLight: '#FFF1F0',
  green: '#027A48', greenLight: '#ECFDF3',
  gray: '#667085', grayLight: '#F9FAFB', grayBorder: '#E4E7EC',
  text: '#101828', text2: '#344054', text3: '#667085',
  white: '#FFFFFF',
};

const font = "'Outfit', sans-serif";
const mono = "'Space Mono', monospace";

// ── Section ──────────────────────────────────────────────────────────────────
export function Section({ icon, iconBg = C.blueLight, title, children, style, action }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: '16px',
      marginBottom: 14, boxShadow: '0 1px 4px rgba(16,24,40,0.06)',
      border: '1px solid rgba(228,231,236,0.8)', ...style
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, paddingBottom: 12,
          borderBottom: '1px solid #F2F4F7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: iconBg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0
            }}>{icon}</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
const VARIANT_STYLES = {
  default: { bg: C.white, border: C.grayBorder, accent: C.blue, textColor: C.text },
  ok:      { bg: C.greenLight, border: '#A6F4C5', accent: C.teal, textColor: C.green },
  warn:    { bg: C.orangeLight, border: '#FECDAA', accent: C.orange, textColor: C.orange },
  alert:   { bg: C.redLight, border: '#FECDCA', accent: C.red, textColor: C.red },
};

export function KpiCard({ label, value, unit, delta, deltaLabel, variant = 'default', icon }) {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const isPos = delta >= 0;
  return (
    <div style={{
      background: v.bg, borderRadius: 14, padding: '14px 14px 14px 16px',
      border: `1px solid ${v.border}`,
      borderLeft: `3px solid ${v.accent}`,
      boxShadow: '0 1px 4px rgba(16,24,40,0.05)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {label}
        </div>
        {icon && (
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: `${v.accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
          }}>{icon}</div>
        )}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700, fontFamily: mono,
        color: v.textColor, margin: '6px 0 4px', lineHeight: 1
      }}>
        {value}
        {unit && <span style={{ fontSize: 11, fontWeight: 400, color: C.text3, marginLeft: 3 }}>{unit}</span>}
      </div>
      {delta !== null && delta !== undefined && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20,
          background: isPos ? '#DCFAE6' : '#FEE4E2',
          color: isPos ? C.green : C.red
        }}>
          {isPos ? '↑' : '↓'} {Math.abs(delta)} {deltaLabel}
        </div>
      )}
    </div>
  );
}

// ── Alert Item ───────────────────────────────────────────────────────────────
export function AlertItem({ type, icon, text, sub, site }) {
  const styles = {
    danger:  { bg: C.redLight, border: C.red, iconBg: '#FECDCA' },
    warning: { bg: C.orangeLight, border: C.orange, iconBg: '#FECDAA' },
    info:    { bg: C.blueLight, border: C.blue, iconBg: '#B2CCFF' },
  };
  const c = styles[type] || styles.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
      borderRadius: 12, marginBottom: 8, background: c.bg,
      borderLeft: `3px solid ${c.border}`
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: c.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {site && (
          <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
            {site}
          </div>
        )}
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{text}</div>
        <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Fuel Bar ─────────────────────────────────────────────────────────────────
export function FuelBar({ value }) {
  const color = value < 10 ? C.red : value < 20 ? C.orange : C.teal;
  const segments = [10, 20, 40, 60, 80, 100];
  return (
    <div>
      <div style={{
        height: 10, borderRadius: 20, background: '#F2F4F7',
        overflow: 'hidden', marginTop: 8, position: 'relative'
      }}>
        <div style={{
          height: '100%', width: `${Math.min(100, Math.max(0, value))}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 20, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {segments.map(s => (
          <span key={s} style={{ fontSize: 9, color: '#C0C8D6', fontFamily: mono }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── Site Selector ─────────────────────────────────────────────────────────────
export function SiteSelector({ sites, current, onSelect }) {
  const statusColor = { online: C.teal, warn: C.orange, offline: C.red };
  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 16,
      overflowX: 'auto', paddingBottom: 2
    }}>
      {sites.map((site, i) => {
        const active = i === current;
        const color = statusColor[site.status] || C.teal;
        return (
          <button
            key={site.id}
            onClick={() => onSelect(i)}
            style={{
              padding: '8px 14px', borderRadius: 24, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: font, fontSize: 12, fontWeight: 600,
              border: active ? 'none' : `1.5px solid ${C.grayBorder}`,
              background: active ? `linear-gradient(135deg, ${C.blue}, ${C.blueMid})` : C.white,
              color: active ? 'white' : C.text2,
              boxShadow: active ? '0 4px 14px rgba(0,87,168,0.25)' : '0 1px 3px rgba(16,24,40,0.04)',
              display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: active ? 'rgba(255,255,255,0.8)' : color,
              ...(site.status === 'online' && !active ? { animation: 'pulse-dot 2s infinite' } : {})
            }} />
            {site.name}
          </button>
        );
      })}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, visible }) {
  const isError = message?.startsWith('❌');
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '100px'})`,
      opacity: visible ? 1 : 0,
      background: isError ? '#1D0408' : '#101828',
      color: 'white', padding: '10px 20px',
      borderRadius: 30, fontSize: 13, fontWeight: 500,
      transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s',
      zIndex: 999, whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 8,
      borderLeft: `3px solid ${isError ? C.red : C.teal}`,
      maxWidth: 'calc(100vw - 40px)'
    }}>
      {message}
    </div>
  );
}

// ── Modal (bottom sheet) ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.6)',
      display: 'flex', alignItems: 'flex-end', zIndex: 200,
      backdropFilter: 'blur(4px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: '24px 24px 0 0',
        padding: '8px 24px 32px', width: '100%',
        maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(16,24,40,0.15)'
      }}>
        <div style={{
          width: 36, height: 4, background: C.grayBorder,
          borderRadius: 2, margin: '8px auto 20px'
        }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 20 }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 18
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    online:  { label: 'En ligne', bg: C.greenLight, color: C.green, dot: C.teal },
    warn:    { label: 'Attention', bg: C.orangeLight, color: C.orange, dot: C.orange },
    offline: { label: 'Hors ligne', bg: C.redLight, color: C.red, dot: C.red },
  };
  const s = map[status] || map.online;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: s.dot,
        flexShrink: 0,
        ...(status === 'online' ? { animation: 'pulse-dot 2s infinite' } : {})
      }} />
      {s.label}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: C.gray }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text2, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export { C };
