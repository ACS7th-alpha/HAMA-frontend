'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import ExpenseModal from '@/app/components/ExpenseModal';

export default function ShoppingCart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('로그인이 필요한 서비스입니다.');
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3008/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('장바구니 조회 실패');

      const data = await response.json();
      setCartItems(data.products || []);
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
      alert('장바구니 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (uid) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3008/cart/remove/${uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('상품 삭제 실패');

      fetchCartItems(); // 장바구니 새로고침
      alert('상품이 장바구니에서 삭제되었습니다.');
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3008/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('장바구니 전체 삭제 실패');

      setCartItems([]); // 장바구니를 빈 배열로 업데이트
      alert('장바구니가 비워졌습니다.');
    } catch (error) {
      console.error('장바구니 전체 삭제 오류:', error);
      alert('장바구니 전체 삭제 중 오류가 발생했습니다.');
    }
  };

    // 🔹 총 가격 계산 (숫자 이외의 문자 제거 후 숫자로 변환)
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + Number(item.sale_price.replace(/\D/g, '')),
        0
    );
  
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex justify-center items-center">
        <div className="animate-bounce text-4xl">🛒</div>
      </div>
    );
  }

  const handleExpenseAdd = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">장바구니</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
            >
              전체 삭제
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다 😢</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition duration-200"
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.uid} className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h2>
                    <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                    <p className="text-xl font-bold text-black">{item.sale_price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.uid)}
                    className="text-black bg-white font-bold"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleExpenseAdd(item)}
                    className="font-medium bg-pink-100 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-200 transition-colors duration-200"
                  >
                    지출 추가
                  </button>
                </div>
              ))}
            </div>


            {/* 🔹 총 가격 표시 추가 */}
            <div className="mt-12 border-t border-gray-300 pt-6 text-center">
              <p className="text-2xl font-semibold text-gray-800">
                총 {cartItems.length}개 상품 금액: <span className="text-pink-500">{totalPrice.toLocaleString()}</span>
              </p>
            </div>
          </>
        )}
      </div>
      {/* 지출 추가 모달 */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
