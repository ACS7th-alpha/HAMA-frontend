'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import ItemCard from '@/app/components/ItemCard';

export default function CommunityPage() {
  const [showRecommended, setShowRecommended] = useState(true);
  const [showNotRecommended, setShowNotRecommended] = useState(true);
  const [items, setItems] = useState([]);

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const accessToken = localStorage.getItem('access_token'); // 액세스 토큰 가져오기
        const response = await fetch('http://localhost:3004/reviews', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`, // 액세스 토큰 사용
          },
        });

        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        console.log('받아온 데이터:', data);

        // createdAt 기준으로 최신순 정렬
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // 내림차순 정렬 (최신순)
        });

        console.log('정렬된 데이터:', sortedData);
        setItems(sortedData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchItems();
  }, []);

  // 필터링된 아이템
  const filteredItems = items.filter(
    (item) =>
      (showRecommended && item.recommended) ||
      (showNotRecommended && !item.recommended)
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-6">
        <h1 className="text-4xl font-bold mb-4">육아 아이템 공유 커뮤니티</h1>
        <p className="text-xl font-medium mb-16">
          이곳에서 육아 아이템을 공유하고 정보를 나눠보세요!
        </p>

        {/* 필터 체크박스 */}
        <div className="flex ml-4 items-center gap-4 mb-6 ">
          <label className="text-xl flex items-center gap-2">
            <input
              type="checkbox"
              className="peer scale-150 accent-orange-300"
              checked={showRecommended}
              onChange={() => setShowRecommended(!showRecommended)}
            />
            추천템
          </label>
          <label className="text-xl flex items-center gap-2">
            <input
              type="checkbox"
              className="peer scale-150 accent-orange-300"
              checked={showNotRecommended}
              onChange={() => setShowNotRecommended(!showNotRecommended)}
            />
            비추천템
          </label>
                  {/* 글 작성 버튼 */}
          <Link
            href="/community/write"
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-xl ml-auto block"
          >
            글 작성
          </Link>
        </div>


        {/* 아이템 목록 */}
        <div className="space-y-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <ItemCard key={item._id} item={item} />)
          ) : (
            <p className="text-center text-gray-600">
              등록된 게시글이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
