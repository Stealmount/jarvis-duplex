'use client';
export default function UsageMeter({ count, limit }) {
  const pct = limit > 0 ? (count / limit) * 100 : 0;
  return (
    <div className="usage-meter" id="usage-meter">
      <span>{count} / {limit}</span>
      <div className="usage-bar">
        <div className={`usage-fill ${pct > 80 ? 'critical' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
