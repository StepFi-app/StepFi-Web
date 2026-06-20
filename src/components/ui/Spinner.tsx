export function Spinner({ size = 20, label = 'Loading' }: { size?: number; label?: string }) {
  return (
    <div
      className="border-2 border-border border-t-brand
        rounded-full animate-spin"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}
