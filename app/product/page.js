'use client';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 40;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3007/products?page=${page}&limit=${limit}`);
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-3">
          <span className="text-4xl">🎀</span>
          오늘의 추천 육아템
          <span className="text-4xl">🎀</span>
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-bounce text-4xl">🍼</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        <p className="text-sm text-gray-500 mb-1">{product.site}</p>
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

            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                ← 이전
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded-full text-black font-medium">
                Page {page}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 transition-colors duration-200 font-medium"
              >
                다음 →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
