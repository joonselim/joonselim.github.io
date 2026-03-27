// src/components/Timeline.tsx

export default function Timeline() {
  const quests = [
    {
      title: "Duke MBA",
      period: "Class of 2027",
      desc: "Expanding business horizons, strategy, and leadership.",
    },
    {
      title: "Shinhan Bank",
      period: "Experience",
      desc: "Built Retirement Pension AI & e-Form System. Bridged finance and tech.",
    },
    {
      title: "Military Alternative Service",
      period: "Experience",
      desc: "Solidified technical groundwork and development skills.",
    },
    {
      title: "Korea Univ. & US High School",
      period: "Education",
      desc: "Foundation of knowledge, adaptability, and global perspective.",
    }
  ];

  return (
    <div className="flex flex-col space-y-6">
      {quests.map((quest, index) => (
        <div key={index} className="flex gap-4 relative">
          {/* 타임라인 세로 선 & 픽셀 점 */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-green-500 border-2 border-black z-10"></div>
            {/* 마지막 아이템이 아니면 선을 그어줌 */}
            {index !== quests.length - 1 && (
              <div className="w-1 h-full bg-zinc-700 -my-2"></div>
            )}
          </div>
          
          {/* 내용 */}
          <div className="pb-6">
            <span className="font-pixel text-xs text-zinc-500 mb-1 block">[{quest.period}]</span>
            <h3 className="font-pixel text-lg text-white mb-1">{quest.title}</h3>
            <p className="text-sm text-zinc-400">{quest.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}