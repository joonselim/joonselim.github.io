// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 이 부분이 GitHub Pages 호스팅을 위한 핵심! 정적 HTML로 뽑아줘.
  images: {
    unoptimized: true, // GitHub Pages에서는 Next.js의 이미지 최적화 기능이 안 먹혀서 꺼줘야 해.
  },
};

export default nextConfig;