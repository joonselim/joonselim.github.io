// src/components/PixelCard.tsx

type PixelCardProps = {
  title: string;
  description: string;
  tags?: string[];
};

export default function PixelCard({ title, description, tags }: PixelCardProps) {
  return (
    <div className="border-4 border-zinc-700 bg-zinc-800 p-6 transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:shadow-[8px_8px_0px_0px_rgba(39,245,129,0.5)] cursor-pointer flex flex-col h-full">
      <h3 className="font-pixel text-xl text-green-400 mb-3">{title}</h3>
      <p className="text-zinc-300 text-sm flex-grow mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* 태그가 있을 경우 렌더링 (사용 기술이나 키워드 등) */}
      {tags && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-zinc-700 text-green-300 font-pixel text-xs px-2 py-1 border border-zinc-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}