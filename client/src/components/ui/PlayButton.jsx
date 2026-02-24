export default function PlayButton({ size = 48, className = '', onClick }) {
  const tri = size * 0.36;
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-sp-green hover:bg-sp-green-light hover:scale-105 transition-all shadow-lg shadow-black/40 cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${tri / 2}px solid transparent`,
          borderBottom: `${tri / 2}px solid transparent`,
          borderLeft: `${tri}px solid #000`,
          marginLeft: size * 0.06,
        }}
      />
    </button>
  );
}
