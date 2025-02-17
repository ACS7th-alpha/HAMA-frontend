'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [token, setToken] = useState(null); // token state 추가

  const categoryIcons = {
    기저귀_물티슈: '👶',
    생활_위생용품: '🧼',
    수유_이유용품: '🍼',
    스킨케어_화장품: '🧴',
    침구류: '🛏️',
  };

  const handleAddToCart = async () => {
    try {
      // 로컬 스토리지에서 토큰 가져오기
      const accessToken = localStorage.getItem('access_token'); // 액세스 토큰 가져오기
      if (!accessToken) {
        alert('로그인이 필요한 서비스입니다.');
        return;
      }

      // POST 요청으로 상품을 장바구니에 추가
      const response = await fetch(`http://localhost:3008/cart/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site: product.site,
          category: product.category,
          link: product.link,
          uid: product.uid,
          name: product.name,
          brand: product.brand,
          sale_price: product.sale_price,
          img: product.img,
          quantity: 1, // 기본값 1로 설정
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('상품이 장바구니에 담겼습니다.');
        router.push('/shoppingcart');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '장바구니 담기에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 담기 오류:', error);
      alert('장바구니 담기에 실패했습니다.');
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!params?.uid) return; // params.uid가 없으면 요청하지 않음

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3007/products/${params.uid}`
        );
        if (!response.ok) throw new Error('상품을 불러올 수 없습니다.');

        const data = await response.json();
        setProduct(data); // 배열이 아니라 단일 객체로 받음
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params?.uid]); // params.uid 변경 시 다시 요청

  useEffect(() => {
    if (userInfo) {
      setIsLoggedIn(true);
    }
  }, [userInfo]);

  // 리뷰 데이터 존재 여부 확인
  const hasReviewData = product?.additionalInfo?.review_summary;

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
  // 각 카테고리별 도넛 차트 데이터 생성 함수
  const createChartData = (value, color) => ({
    labels: ['', ''],
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [
          color,
          'rgba(229, 231, 235, 0.5)', // 회색 배경
        ],
        borderWidth: 0,
        borderRadius: 20,
      },
    ],
  });

  // 차트 옵션
  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: true,
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* 상단 네비게이션 */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 bg-white hover:text-pink-600 transition-colors flex items-center gap-2"
        >
          ← 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden ">
          <div className="md:flex">
            {/* 이미지 섹션 */}
            <div className="md:w-1/2 p-12">
              <div className="aspect-square rounded-2xl overflow-hidden border-2 border-orange-200">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* 상품 정보 섹션 */}

            <div className="mt-2 md:w-1/2">
              {/* 카테고리 뱃지 추가 */}
              <div className="flex items-center mt-12">
                <span className="inline-block bg-orange-200 px-4 py-1 rounded-full text-base font-medium">
                  {categoryIcons[product.category] || '🎁'} {product.category}
                </span>
              </div>
              <div className=" rounded-2xl p-2 mb-6 mr-4">
                <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-3 mr-12">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-black mb-4">
                  {product.sale_price}
                </p>
                <hr className="border-gray-200 my-4 mt-10 mr-12" />
                <div className="grid grid-cols-[100px_auto] gap-x-4 gap-y-2 text-black text-base">
                  <span className="font-medium">브랜드</span>{' '}
                  <span>{product.brand}</span>
                  <span className="font-medium">구매처</span>{' '}
                  <span>{product.site}</span>
                </div>
                <hr className="border-gray-200 my-4 mr-12" />
              </div>
              <div className="flex gap-4 mt-8 mb-12 items-center ml-12">
                <button
                  onClick={handleAddToCart}
                  className="w-36 h-12 bg-orange-400 text-white py-3 px-4 hover:bg-orange-600 transition-colors duration-200"
                >
                  장바구니 담기
                </button>
                {product.link && (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-36 py-3 px-4 h-12 bg-white border-2 border-orange-500 text-orange-600 hover:text-black transition-colors duration-200 text-center flex items-center justify-center"
                  >
                    구매하러 가기
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 - 조건부 렌더링 */}
        {hasReviewData > 0 ? (
          <div className="mt-12 bg-white rounded-3xl shadow-lg p-8 relative">
            {/* 로그인하지 않은 경우 블러 처리 및 알림 */}
            {!isLoggedIn && (
              <>
                {/* 블러 레이어 */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-3xl z-40" />
                {/* 컨텐츠 레이어 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 p-8">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    로그인이 필요한 기능입니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    상세한 리뷰 분석을 보시려면 로그인해 주세요
                  </p>
                </div>
              </>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              실제 구매자 리뷰 분석
              <span className="text-2xl">✨</span>
            </h2>
            {/* 리뷰 통계 - 개별 도넛 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-12">
              {/* 긍정적 리뷰 차트 */}
              <div className=" rounded-2xl p-6 relative">
                <div className="w-40 h-40 mx-auto">
                  <Doughnut
                    data={createChartData(
                      product.additionalInfo.review_percent.positive,
                      'rgba(34, 197, 94, 0.8)' // 녹색
                    )}
                    options={chartOptions}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {product.additionalInfo.review_percent.positive?.toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">긍정적</div>
                  </div>
                </div>
              </div>

              {/* 부정적 리뷰 차트 */}
              <div className="rounded-2xl p-6 relative">
                <div className="w-40 h-40 mx-auto">
                  <Doughnut
                    data={createChartData(
                      product.additionalInfo.review_percent.negative,
                      'rgba(239, 68, 68, 0.8)' // 빨간색
                    )}
                    options={chartOptions}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {product.additionalInfo.review_percent.negative?.toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">부정적</div>
                  </div>
                </div>
              </div>

              {/* 중립적 리뷰 차트 */}
              <div className=" rounded-2xl p-6 relative">
                <div className="w-40 h-40 mx-auto">
                  <Doughnut
                    data={createChartData(
                      product.additionalInfo.review_percent.neutral,
                      'rgba(156, 163, 175, 0.8)' // 회색
                    )}
                    options={chartOptions}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {product.additionalInfo.review_percent.neutral?.toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">중립적</div>
                  </div>
                </div>
              </div>
            </div>
            {/* 장점 */}
            {product.additionalInfo.review_summary.advantages?.length > 0 && (
              <div className="mb-8 px-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 bg-green-50 p-4 rounded-xl">
                  <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <span className="text-xl">👍</span>
                  </span>
                  <span>이런 점이 좋아요!</span>
                </h3>
                <div className="grid gap-3 pl-4">
                  {product.additionalInfo.review_summary.advantages.map(
                    (advantage, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white p-4 rounded-xl border border-green-100 hover:border-green-200 transition-colors"
                      >
                        <span className="text-green-500 font-bold">✓</span>
                        <span className="text-gray-700">{advantage}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 단점 */}
            {product.additionalInfo.review_summary.disadvantages?.length >
              0 && (
              <div className="mb-8 px-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 bg-red-50 p-4 rounded-xl">
                  <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <span className="text-xl">👎</span>
                  </span>
                  <span>이런 점은 아쉬워요</span>
                </h3>
                <div className="grid gap-3 pl-4">
                  {product.additionalInfo.review_summary.disadvantages.map(
                    (disadvantage, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white p-4 rounded-xl border border-red-100 hover:border-red-200 transition-colors"
                      >
                        <span className="text-red-500 font-bold">!</span>
                        <span className="text-gray-700">{disadvantage}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 bg-white rounded-3xl shadow-lg p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-12">해당 상품은 현재 분석 가능한 리뷰가 없습니다.</h2>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">곧 더 많은 정보를 제공할 예정입니다!</h2>
            
          </div>
        )}
      </div>
    </div>
  );
}
