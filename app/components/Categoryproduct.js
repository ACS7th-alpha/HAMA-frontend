'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CategoryProduct() {
  const [userInfo, setUserInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('수유_이유용품');
  const [childName, setChildName] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const limit = 40;

  // 카테고리 목록 정의
  const categories = [
    { id: '수유_이유용품', name: '수유/이유용품', icon: '🍼' },
    { id: '기저귀_물티슈', name: '기저귀/물티슈', icon: '👶' },
    { id: '스킨케어_화장품', name: '스킨케어/화장품', icon: '🧴' },
    { id: '생활_위생용품', name: '생활/위생용품', icon: '🧼' },
    { id: '침구류', name: '침구류', icon: '🌛' },
    { id: '식품', name: '식품', icon: '🧀' },
    { id: '완구용품', name: '완구용품', icon: '✏️' },
    { id: '패션의류_잡화', name: '패션의류/잡화', icon: '👕' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUserInfo(parsedUserData);
        if (parsedUserData.children && parsedUserData.children.length > 0) {
          const firstChild = parsedUserData.children[0];
          setChildName(firstChild.name);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url;
        if (category === '전체') {
          url = `${process.env.BACKEND_SEARCH_URL}/products?page=${page}&limit=${limit}`;
        } else {
          url = `${process.env.BACKEND_SEARCH_URL}/products/category/${category}?page=${page}&limit=${limit}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.ceil(data.total / limit)); // Calculate total pages
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, page]);

  const handleCategoryClick = (categoryId) => {
    setCategory(categoryId);
    setPage(1); // 카테고리 변경 시 페이지 1로 리셋
  };

  // Get the current page range (5 pages per group)
  const getPageRange = () => {
    const startPage = Math.floor((page - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();

  // 컴포넌트 마운트 시 저장된 상태와 스크롤 위치 복원
  useEffect(() => {
    const savedPage = sessionStorage.getItem('prevPage');
    const savedCategory = sessionStorage.getItem('prevCategory');
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');

    if (savedPage) {
      setPage(parseInt(savedPage));
      sessionStorage.removeItem('prevPage');
    }
    if (savedCategory) {
      setCategory(savedCategory);
      sessionStorage.removeItem('prevCategory');
    }
    if (savedScrollPosition) {
      // 약간의 지연을 주어 컨텐츠가 로드된 후 스크롤 위치를 복원
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('scrollPosition');
      }, 100);
    }
  }, []);

  // 상품 클릭 핸들러 추가
  const handleProductClick = (uid) => {
    router.push(`/product/${uid}`);
  };

  return (
    <div className="min-h-screen bg-white mt-12">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-3">
          <span className="text-3xl">
            {childName ? `${childName}맘 주목 카테고리` : '맘 주목 카테고리'}
          </span>
        </h1>

        {/* 카테고리 버튼 */}
        <div className="mb-24 mt-12">
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`
                    w-20 h-20 // 동그라미 크기 조정
                    rounded-full 
                    flex items-center justify-center
                    transition-all duration-200
                    ${
                      category === cat.id
                        ? 'bg-orange-400 text-white shadow-lg transform scale-110'
                        : 'bg-orange-50 text-gray-700 hover:bg-pink-100 hover:scale-105'
                    }
                `}
                >
                  <span className="text-4xl">{cat.icon}</span>
                </button>
                <span className="text-l font-medium text-gray-700">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
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
                  onClick={() => handleProductClick(product.uid)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-pink-100 hover:border-pink-200 cursor-pointer"
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
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-l font-medium text-gray-700 line-clamp-2">
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
