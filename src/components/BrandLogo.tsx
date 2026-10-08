export function BrandLogo({ symbolOnly = false, className = '' }: { symbolOnly?: boolean; className?: string }) {
  if (symbolOnly) {
    return <img src="/brand/risense-symbol.svg" alt="Risense" width={117} height={110} className={`h-7 w-auto shrink-0 ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img src="/brand/risense-symbol.svg" alt="" width={117} height={110} className="h-6 w-auto" />
      <img src="/brand/risense-wordmark.svg" alt="Risense" width={317} height={71} className="h-5 w-auto" />
    </span>
  );
}
