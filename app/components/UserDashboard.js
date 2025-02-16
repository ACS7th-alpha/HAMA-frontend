import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 라우터 추가

export default function UserDashboard({
  userInfo,
  childAge,
  monthlySpending,
  remainingBudget,
}) {
  const router = useRouter(); // 라우터 초기화화
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    fetchAgeBasedProducts();
  }, [childAge]);

  const fetchAgeBasedProducts = async () => {
    try {
      const limit = 40;
      const page = 1;
      let keyword;
  
      // 연령에 따른 키워드 설정
      if (childAge <= 1) {
        keyword = '신생아';
      } else if (childAge < 12) {
        keyword = '영유아';
      } else if (childAge < 36) {
        keyword = '유아';
      } else {
        keyword = '어린이';
      }
      
      // 검색 API 사용
      const searchUrl = `http://localhost:3007/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`;
      console.log('Fetching URL:', searchUrl);
      const response = await fetch(searchUrl);

      // 응답 상태 확인
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`상품 조회 실패: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      const productsArray = responseData.data || [];
      setProducts(productsArray);
      
      console.log(`${keyword} 상품 개수:`, productsArray.length);
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setProducts([]);
    }
  };

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 4 >= products.length ? 0 : prevIndex + 4
    );
  };

  // 이전 슬라이드로 이동
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 4 < 0 ? Math.max(products.length - 4, 0) : prevIndex - 4
    );
  };
  // 현재 보여줄 상품들
  const currentProducts = products.slice(currentIndex, currentIndex + 4); 
  
  // 프로그레스 바의 퍼센테이지 계산
  const spendingPercentage = userInfo.monthlyBudget
    ? Math.min((monthlySpending / userInfo.monthlyBudget) * 100, 100)
    : 0;

  const spendingPercentage2 = userInfo.monthlyBudget
    ? Math.floor((monthlySpending / userInfo.monthlyBudget) * 100)
    : 0;

  // 상품 클릭 핸들러 추가
  const handleProductClick = (uid) => {
    router.push(`/product/${uid}`);
  };

  return (
    <div className="bg-gradient-to-b from-pink-50 to-yellow-50 w-3/4 mx-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex justify-between items-center">
            {/* 사용자 프로필 섹션 */}
            <div className="flex flex-col items-center">
              {userInfo.photo && (
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-pink-200 shadow-lg">
                  <img
                    src={userInfo.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800">
                {userInfo.nickname} <span className="ml-1"> </span>
              </h2>
              {childAge !== null && (
                <p className="text-lg mt-2 text-gray-600 bg-pink-100 px-4 py-1 rounded-full">
                  {childAge}개월
                </p>
              )}
            </div>

            {/* 예산 정보 섹션 */}
            <div className="flex-1 ml-12">
              <div className="bg-pink-10 rounded-2xl p-8 shadow-md border-2 border-blue-10">
                <div className="mb-4 text-left">
                  <p className="text-gray-800 flex items-center text-lg">
                    <span className="mr-2">💰</span> 이번 달 예산
                  </p>
                  <p className="text-3xl font-bold text-black mt-2">
                    {Number(userInfo.monthlyBudget)?.toLocaleString('ko-KR')}원
                  </p>
                </div>
                <div className="w-full h-5 bg-white rounded-full overflow-hidden mt-4 shadow-inner">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                    style={{ width: `${spendingPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-3 text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-1">💸</span> 사용:{' '}
                    {monthlySpending.toLocaleString()}원
                  </span>
                  <span className="flex items-center ml-4">
                    <span className="mr-1">✨</span> 사용:{' '}
                    {spendingPercentage2.toLocaleString()}%{' '}
                    <span className="text-gray-600 ml-2">
                      {remainingBudget.toLocaleString()}원
                    </span>
                  </span>
                </div>
              </div>

              {/* 새로운 귀여운 네모 칸 추가 */}
              <div className="bg-white rounded-2xl p-4 mt-6 shadow-md border-2 border-blue-10">
                {monthlySpending > userInfo.monthlyBudget ? ( // 조건부 렌더링
                  <p className="text-xl font-semibold text-red-500 text-center">
                    이번 달 예산을 다 쓰셔서, 아끼셔야 해요! 😢
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-center">
                    <span role="img" aria-label="pig">
                      🐻
                    </span>{' '}
                    하루에{' '}
                    <span className="text-green-500 font-bold text-lg">
                      {(() => {
                        const remainingBudget =
                          userInfo.monthlyBudget - monthlySpending;
                        const remainingDays =
                          new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            0
                          ).getDate() - new Date().getDate();
                        return remainingDays > 0
                          ? (remainingBudget / remainingDays).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 0 }
                            )
                          : 0;
                      })()}
                      원
                    </span>{' '}
                    이하로 써야 예산을 지킬 수 있어요!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 준비리스트 섹션 추가 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {childAge}개월, 준비리스트
        </h2>
        <div className="relative">
        {/* 이전 버튼 */}
        {products.length > 4 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {/* 상품 그리드 */}
        <div className="grid grid-cols-4 gap-4">
          {currentProducts.map((product) => (
            <div 
              key={product.uid} 
              onClick={() => handleProductClick(product.uid)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
            >
              <div className="relative pb-[100%]">
                <img
                  src={product.img}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-pink-500">
                  {product.sale_price}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* 다음 버튼 */}
        {products.length > 4 && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

