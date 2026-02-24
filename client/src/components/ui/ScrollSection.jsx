export default function ScrollSection({ title, children }) {
  return (
    <section className="mb-2">
      <div className="flex items-center justify-between mb-3 px-6">
        <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">{title}</h2>
        <button className="text-sm font-semibold text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          Mostrar tudo
        </button>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
