// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: [
//       "t4.ftcdn.net",
//       "img.danawa.com",
//       "i.ytimg.com",
//       "minhwashop.kr",
//       "kidsmile.co.kr",
//       "img1.daumcdn.net",
//     ], // 허용할 도메인 추가
//   },
// };

// module.exports = nextConfig;
// /** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // ESLint 오류 무시
  },
};

module.exports = nextConfig;
