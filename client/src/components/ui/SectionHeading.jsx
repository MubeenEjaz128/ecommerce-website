function SectionHeading({ eyebrow, title, description, children }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>}
      <h2 className="mt-4 text-3xl font-black tracking-tight text-text sm:text-4xl">{title || children}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-muted">{description}</p> : null}
    </div>
  );
}

export default SectionHeading;