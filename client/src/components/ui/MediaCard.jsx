import PlayButton from './PlayButton';

export default function MediaCard({ image, name, desc, circular = false, onPlay }) {
  return (
    <div
      className="group flex flex-col bg-sp-surface hover:bg-sp-elevated rounded-lg p-3 transition-colors cursor-pointer shrink-0 w-[164px]"
      onClick={onPlay}
    >
      <div className="relative mb-3">
        <img
          src={image}
          alt={name}
          className={`shadow-lg shadow-black/40 object-cover ${
            circular
              ? 'w-[140px] h-[140px] rounded-full mx-auto'
              : 'w-full aspect-square rounded-md'
          }`}
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <PlayButton size={44} onClick={(e) => { e.stopPropagation(); onPlay?.(); }} />
        </div>
      </div>
      <span className={`text-sm font-semibold text-white truncate ${circular ? 'text-center' : ''}`}>{name}</span>
      {desc && <span className="text-xs text-sp-text-sub mt-1 line-clamp-2 leading-relaxed">{desc}</span>}
    </div>
  );
}
