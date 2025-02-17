'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // 총 건수 상태 추가
  const [page, setPage] = useState(1);
  const limit = 40;

  useEffect(() => {
    async function fetchSearchResults() {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL
          }/search?keyword=${encodeURIComponent(
            keyword
          )}&page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.ceil(data.total / limit)); // Calculate total pages
        setTotalCount(data.total || 0); // 총 건수 설정
      } catch (error) {
        console.error('Error fetching search results:', error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b flex justify-center items-center">
        <div className="animate-bounce text-4xl">🔍</div>
      </div>
    );
  }

  const getPageRange = () => {
    const startPage = Math.floor((page - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* 검색 결과 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            &ldquo;{keyword}&rdquo; 검색 결과
          </h1>
          <p className="text-xl text-gray-600">
            총{' '}
            <span className="text-xl font-bold text-orange-500">
              {totalCount}
            </span>
            건의 상품이 있습니다
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">검색 결과가 없습니다 😢</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.uid}
                  href={`/product/${product.uid}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 block"
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h2>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {product.site}
                      </p>
                      <p className="text-xl font-bold text-black">
                        {product.sale_price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length > 0 && (
              <div className="flex justify-center items-center gap-1 mt-12">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  ← 이전
                </button>

                {/* 페이지 번호 목록 */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, idx) => startPage + idx
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`rounded-full text-pink-600 font-medium ${
                        page === n ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* "Next" arrow for the next set of pages */}
                {endPage < totalPages && (
                  <button
                    onClick={() => setPage(endPage + 1)}
                    className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 transition-colors duration-200 font-medium"
                  >
                    → 다음
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
