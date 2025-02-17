'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function Firstpage({ images = [], currentImage = 0 }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-blue-50 py-20">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <span className="text-4xl">👶</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            <span className="text-yellow-400">HAMA</span>와 함께
            <span className="inline-block animate-bounce ml-2">🎈</span>
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-4">
            최저가 육아 용품 구매, 소비패턴 분석을 한 곳에서
            <span className="inline-block ml-2">✨</span>
          </p>
          <p className="max-w-2xl mx-auto text-gray-600 mb-10 leading-relaxed">
            온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면 
            해당 조건에 맞는 최저가 육아 용품을 추천합니다.
            월별 소비 내역 및 카테고리별 지출 통계를 통해 
            육아 비용을 체계적으로 관리합니다.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-[16/9] bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-100">
              {images.length > 0 ? (
                <img
                  src={images?.[currentImage] ?? '/default-banner.png'}
                  alt="배너 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-6xl">🎠</span>
                </div>
              )}
            </div>
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌟</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🎪</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
