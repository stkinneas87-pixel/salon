export function Marquee({ words }: { words: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="flex items-center">
          <span className="display px-6 text-[clamp(2.5rem,6vw,6rem)] leading-none text-white italic lg:px-10">
            {word}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-white/15 bg-ink py-3">
      <div className="marquee-track">
        {row}
        <div aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
