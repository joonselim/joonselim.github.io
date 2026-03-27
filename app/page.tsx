// src/app/page.tsx
import PixelCard from "../components/PixelCard";
import Timeline from "../components/Timeline";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-20 max-w-4xl mx-auto selection:bg-green-500 selection:text-black">
      
      {/* 1. Hero 섹션 */}
      <section className="mb-24 border-4 border-zinc-700 p-8 relative shadow-[8px_8px_0px_0px_rgba(39,245,129,0.3)] bg-zinc-800 mt-10">
        <h1 className="font-pixel text-4xl md:text-5xl text-green-400 mb-4 tracking-wider">
          Hello, World!_
        </h1>
        <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
          Building systems, analyzing data, and connecting the dots. <br/>
          I bridge the gap between business strategy and tech execution.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <span className="bg-green-500 text-black font-pixel px-3 py-1 text-sm shadow-[2px_2px_0px_0px_#fff]">US Green Card</span>
          <span className="bg-zinc-800 text-green-400 font-pixel px-3 py-1 text-sm border-2 border-green-400">Duke MBA '27</span>
          <span className="bg-zinc-800 text-green-400 font-pixel px-3 py-1 text-sm border-2 border-green-400">PM / Analyst</span>
        </div>
      </section>

      {/* 2. 내가 걸어온 길 (Timeline Component) */}
      <section className="mb-24">
        <h2 className="font-pixel text-2xl text-green-400 mb-8">{">"} Quest_Log</h2>
        <Timeline />
      </section>

      {/* 3. 직무 및 역량 (PixelCard Component) */}
      <section className="mb-24">
        <h2 className="font-pixel text-2xl text-green-400 mb-8">{">"} Skill_Tree</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PixelCard 
            title="PM & Strategy" 
            description="프로덕트의 방향성을 설정하고, 비즈니스 임팩트를 극대화하는 전략을 수립합니다."
            tags={["Product_Management", "Business_Strategy"]}
          />
          <PixelCard 
            title="Data & Analyst" 
            description="데이터 속에서 인사이트를 도출하고, 논리적인 의사결정을 돕습니다."
            tags={["Data_Analysis", "SQL", "Operations"]}
          />
        </div>
      </section>

      {/* 4. 포트폴리오 (PixelCard Component 재사용) */}
      <section className="mb-24">
        <h2 className="font-pixel text-2xl text-green-400 mb-8">{">"} Inventory (Projects)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PixelCard 
            title="AI Era" 
            description="Microsoft Build-a-thon 참여 및 Unity 기반 3D 골프앱 프로토타입 제작 등 최신 기술 탐구"
            tags={["GenAI", "Unity", "C#"]}
          />
          <PixelCard 
            title="Shinhan Bank" 
            description="퇴직연금 인공지능 시스템 및 펀드 시스템, 포시에스 e-Form 결재 시스템 구축 리드"
            tags={["FinTech", "AI", "System_Architecture"]}
          />
          <PixelCard 
            title="Undergrad" 
            description="딥러닝, 인공지능, 챗봇 관련 학부 시절 연구 및 프로젝트"
            tags={["Deep_Learning", "Chatbot", "Python"]}
          />
        </div>
      </section>

      {/* AI 챗봇 들어갈 자리 (임시) */}
      <div className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 border-2 border-black flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_#fff] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#fff] transition-all z-50">
        <span className="font-pixel text-black text-2xl mt-1">?</span>
      </div>

    </main>
  );
}