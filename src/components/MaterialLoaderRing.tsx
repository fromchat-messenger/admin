type MaterialLoaderRingProps = {
  className?: string;
  size?: string;
};

export function MaterialLoaderRing({ className, size = "6rem" }: MaterialLoaderRingProps) {
  return (
    <svg
      className={className}
      style={{ width: size, height: size }}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <circle className="material-loader__track" cx="24" cy="24" r="20" fill="none" strokeWidth="4" />
      <circle
        className="material-loader__arc"
        cx="24"
        cy="24"
        r="20"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}