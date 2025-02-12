'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const handleDeleteAccount = async () => {
    if (!userInfo) return;

    const confirmDelete = window.confirm('정말 계정을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem('access_token');

      // 예산 삭제 요청
      const budgetResponse = await fetch('http://localhost:3005/budget', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (budgetResponse.status === 404) {
        console.log('예산 데이터가 없습니다.'); // 예외 처리
      } else if (!budgetResponse.ok) {
        throw new Error('예산 삭제 실패');
      } else {
        console.log('예산 삭제 성공');
      }

      // 회원 탈퇴 요청
      const response = await fetch('http://localhost:3001/auth/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('계정 삭제 실패');

      // 계정 삭제 성공 시 로컬 저장소 데이터 삭제 후 메인 페이지로 이동
      localStorage.clear(); // 모든 로컬 저장소 데이터 삭제
      alert('계정이 삭제되었습니다.');
      router.push('/'); // 로그인 전의 메인 페이지로 이동
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-0">
      <Header />
      <div className="max-w-6xl mx-auto p-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
              <img
                src={userInfo.photo}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {userInfo.nickname} <span className="ml-2">👋</span>
              </h1>
              <p className="text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            프로필 정보
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'children'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            자녀 정보
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-yellow-300 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            내가 쓴 글
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            설정
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-3xl shadow-lg p-12">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                프로필 정보 <span className="ml-2">📝</span>
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-2">이메일</p>
                  <p className="text-lg font-semibold">{userInfo.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">닉네임</p>
                  <p className="text-lg font-semibold">{userInfo.nickname}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">월 예산</p>
                  <p className="text-lg font-semibold">
                    {userInfo.monthlyBudget?.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                자녀 정보 <span className="ml-2">👶</span>
              </h2>
              {userInfo.children && userInfo.children.length > 0 ? (
                userInfo.children.map((child, index) => (
                  <div
                    key={index}
                    className=" rounded-2xl p-6 border-2 border-blue-100"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 mb-2">이름</p>
                        <p className="text-lg font-semibold">{child.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">생년월일</p>
                        <p className="text-lg font-semibold">
                          {new Date(child.birthdate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">성별</p>
                        <p className="text-lg font-semibold">{child.gender}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">등록된 자녀 정보가 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                설정 <span className="ml-2">⚙️</span>
              </h2>
              <div className="flex items-center justify-between p-8 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold">계정 삭제</h3>
                  <p className="text-l text-gray-600">
                    회원 탈퇴 및 데이터 삭제
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
