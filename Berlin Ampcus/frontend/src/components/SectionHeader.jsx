export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
