'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from '@/app/components/Header';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  const categoryIcons = {
    '기저귀_물티슈': '👶',
    '생활_위생용품': '🧼',
    '수유_이유용품': '🍼',
    '스킨케어_화장품': '🧴',
    '침구류': '🛏️',
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!params?.uid) return; // params.uid가 없으면 요청하지 않음

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3007/products/${params.uid}`);
        if (!response.ok) throw new Error("상품을 불러올 수 없습니다.");
        
        const data = await response.json();
        setProduct(data);  // 배열이 아니라 단일 객체로 받음
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params?.uid]);  // params.uid 변경 시 다시 요청

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex justify-center items-center">
        <div className="animate-bounce text-4xl">🧸</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🎈</div>
          <p className="text-gray-500 mb-4">상품을 찾을 수 없어요</p>
          <button
            onClick={() => router.back()}
            className="text-pink-600 hover:text-pink-700 font-medium bg-pink-50 px-6 py-2 rounded-full hover:bg-pink-100 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
    <Header />
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* 상단 네비게이션 */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 bg-pink-50 hover:text-pink-600 transition-colors flex items-center gap-2"
        >
          ← 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden ">
          <div className="md:flex">
            {/* 이미지 섹션 */}
            <div className="md:w-1/2 p-6">
              <div className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-200">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* 상품 정보 섹션 */}

            <div className="md:w-1/2 p-8">
              {/* 카테고리 뱃지 추가 */}  
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block bg-pink-100 px-4 py-1 rounded-full text-sm font-medium">
                  {categoryIcons[product.category] || '🎁'} {product.category}
                </span>
              </div>
              <div className=" rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block bg-white text-pink-600 px-4 py-1 rounded-full text-sm font-medium">
                    {product.brand}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <span className="text-lg">🏪</span>
                  {product.site}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg"></span>
                  <p className="text-2xl font-bold text-black">
                    {product.sale_price}
                  </p>
                </div>
              </div>

              {/* 구매 버튼 섹션 */}
              <div className="space-y-4">
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-pink-300 to-yellow-200 text-white text-center py-4 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-lg"
                >
                  구매하러 가기
                </a>
        
                {/* 추가 정보 */}
                <div className="bg-blue-50 rounded-2xl p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span>👶</span>
                    <span>아기와 엄마를 위한 제품</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>안전하고 믿을 수 있는 제품</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 추천 문구 */}
        <div className="text-center mt-8 text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <span className="text-xl">🌟</span>
            육아맘이 추천하는 베스트 아이템
            <span className="text-xl">🌟</span>
          </p>
        </div>
      </div>
    </div>
  );
}