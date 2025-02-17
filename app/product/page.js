'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('전체');
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const limit = 8; // 화면에 표시할 개수

  // Fisher-Yates 알고리즘으로 배열을 랜덤하게 섞기
  function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 로그인 상태 확인
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  // 상품 데이터 가져오기
  useEffect(() => {
    if (userInfo) return;

    async function fetchProducts() {
      setLoading(true);
      try {
        let url;
        if (category === '전체') {
          url = `http://localhost:3007/products?random=${Math.random()}`; // 모든 상품 가져오기
        } else {
          url = `http://localhost:3007/products/category/${category}?random=${Math.random()}`;
        }

        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-store', // 캐시 방지
          },
        });

        const data = await response.json();
        if (Array.isArray(data.data)) {
          const shuffledProducts = shuffleArray(data.data); // 전체 데이터를 섞음
          setProducts(shuffledProducts.slice(0, limit)); // 상위 8개만 선택
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, userInfo]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  if (userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mt-20 mb-8 text-gray-800 text-center flex items-center justify-center gap-3">
          <span className="text-3xl"> 똑똑한 엄마들의 스마트한 육아 쇼핑 </span>
        </h1>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-bounce text-4xl">🍼</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md-grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.uid}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-pink-100 hover:border-pink-200"
                >
                  <div className="relative group">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-l font-medium text-gray-700">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h2>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {product.site}
                        </p>
                        <p className="text-xl font-bold text-black">
                          {product.sale_price}
                        </p>
                      </div>
                      <Link
                        href={`/product/${product.uid}`}
                        className="flex items-center gap-1 bg-orange-100 hover:bg-pink-200 text-orange-600 px-4 py-2 rounded-full text-xs font-medium transition-colors duration-200"
                      >
                        자세히 보기 <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">
                  해당 카테고리의 상품이 없습니다 🎈
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
