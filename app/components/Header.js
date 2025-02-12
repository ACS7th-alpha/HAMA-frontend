'use client';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';

export default function Header({ onLogin }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenCheckInterval, setTokenCheckInterval] = useState(null);

  // 토큰 상태 체크 함수
  const checkTokenStatus = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const currentTime = new Date();
    const tokenLastPart = token ? `...${token.slice(-10)}` : '없음';
    const refreshLastPart = refreshToken
      ? `...${refreshToken.slice(-10)}`
      : '없음';

    // console.log(
    //   `\n=== 토큰 상태 체크 [${currentTime.toLocaleTimeString()}] ===`
    // );
    // console.log('현재 Access Token (마지막 10자):', tokenLastPart);
    // console.log('현재 Refresh Token (마지막 10자):', refreshLastPart);
    // console.log('----------------------------------------');
  };

  // 토큰 갱신 함수
  const refreshAccessToken = async () => {
    try {
      const oldToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const currentTime = new Date();

      console.log(
        `\n=== 토큰 갱신 시도 [${currentTime.toLocaleTimeString()}] ===`
      );
      console.log(
        '기존 Access Token (마지막 10자):',
        oldToken ? `...${oldToken.slice(-10)}` : '없음'
      );
      console.log(
        '사용할 Refresh Token (마지막 10자):',
        refreshToken ? `...${refreshToken.slice(-10)}` : '없음'
      );
      console.log('갱신 요청 시작...');

      const response = await fetch('http://localhost:3001/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      console.log('서버 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;

        console.log('\n=== 토큰 갱신 성공 ===');
        console.log(
          '이전 Access Token (마지막 10자):',
          oldToken ? `...${oldToken.slice(-10)}` : '없음'
        );
        console.log(
          '새로운 Access Token (마지막 10자):',
          newToken ? `...${newToken.slice(-10)}` : '없음'
        );
        console.log(
          '토큰 변경 여부:',
          oldToken !== newToken ? '✅ 토큰이 변경됨' : '❌ 토큰이 동일함'
        );
        console.log('갱신 완료 시간:', currentTime.toLocaleTimeString());

        localStorage.setItem('access_token', newToken);
        console.log('새로운 토큰 저장 완료');

        // 다음 갱신 타이머 설정 (30초)
        const THIRTY_SECONDS = 60 * 60 * 1000;
        const nextRefreshTime = new Date(Date.now() + THIRTY_SECONDS);
        console.log(
          '다음 갱신 예정 시간:',
          nextRefreshTime.toLocaleTimeString()
        );
        console.log('남은 시간: 30초');

        setTimeout(refreshAccessToken, THIRTY_SECONDS);
      } else {
        console.error('\n=== 토큰 갱신 실패 ===');
        console.error('응답 상태:', response.status);
        console.error('에러 메시지:', await response.text());
        console.error('실패 시간:', currentTime.toLocaleTimeString());
        handleLogout();
      }
    } catch (error) {
      console.error('\n=== 토큰 갱신 중 오류 발생 ===');
      console.error('에러 내용:', error);
      console.error('발생 시간:', new Date().toLocaleTimeString());
      handleLogout();
    }
  };

  // 토큰 갱신 타이머 설정 함수
  const setTokenRefreshTimer = () => {
    const THIRTY_SECONDS = 60 * 60 * 1000; // 30초로 변경
    const nextRefreshTime = new Date(Date.now() + THIRTY_SECONDS);

    console.log('\n=== 토큰 갱신 타이머 설정 ===');
    console.log('현재 시간:', new Date().toLocaleTimeString());
    console.log('다음 갱신 예정 시간:', nextRefreshTime.toLocaleTimeString());
    console.log('남은 시간: 30초');

    setTimeout(refreshAccessToken, THIRTY_SECONDS);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const user = localStorage.getItem('user');
    const currentTime = new Date();

    console.log(
      `\n=== 초기 로그인 상태 체크 [${currentTime.toLocaleTimeString()}] ===`
    );
    console.log('Access Token:', token);
    console.log('Refresh Token:', refreshToken);
    console.log('User Data:', user ? JSON.parse(user) : null);
    console.log('로그인 상태:', !!token);

    if (token && refreshToken) {
      setIsLoggedIn(true);
      setTokenRefreshTimer();

      // 5초마다 토큰 상태 체크
      const interval = setInterval(checkTokenStatus, 5000);
      setTokenCheckInterval(interval);
      console.log('토큰 상태 체크 타이머 설정 완료 (5초 간격)');
    }

    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        console.log('토큰 체크 인터벌 정리 완료');
      }
      clearTimeout(setTokenRefreshTimer);
      console.log('토큰 갱신 타이머 정리 완료');
    };
  }, []);

  const handleLogout = () => {
    console.log('=== 로그아웃 시작 ===');
    console.log('제거할 토큰들:');
    console.log('Access Token:', localStorage.getItem('access_token'));
    console.log('Refresh Token:', localStorage.getItem('refresh_token'));
    console.log('User Data:', localStorage.getItem('user'));

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // 토큰 체크 인터벌 정리
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    console.log('=== 로그아웃 완료 ===');
    console.log('토큰 제거 후 상태:');
    console.log('Access Token:', localStorage.getItem('access_token'));
    console.log('Refresh Token:', localStorage.getItem('refresh_token'));
    console.log('User Data:', localStorage.getItem('user'));

    // 메인 페이지로 리다이렉트
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-md p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-6">
        <Link href="/">
          <Image src="/hama_logo.jpg" alt="HAMA Logo" width={150} height={50} />
        </Link>

        <div className="flex justify-center">
          <input
            type="text"
            placeholder="어떤 상품을 찾으시나요?"
            className="w-full px-8 py-3 border-2 border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg placeholder-gray-400 shadow-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn && onLogin && (
            <GoogleLogin
              onSuccess={(response) => {
                console.log('=== Google 로그인 성공 ===');
                console.log('Google Response:', response);
                onLogin(response);
              }}
              onError={() => {
                console.error('=== Google 로그인 실패 ===');
                console.error('Login Failed');
              }}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              locale="ko"
              width="300"
              context="signin"
              theme="outline"
              size="large"
              type="standard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            />
          )}
          {isLoggedIn && (
            <nav className="flex items-center gap-1">
              {/* 장바구니 버튼 */}
              <Link
                href="/cart"
                className="flex flex-col items-center gap-2 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <span className="text-xl">🛒</span>
                <span className="font-semibold">장바구니</span>
              </Link>

              {/* 마이페이지 버튼 */}
              <Link
                href="/mypage"
                className="flex flex-col items-center gap-2 px-4 py-2 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
              >
                <span className="text-xl">👤</span>
                <span className="font-semibold">마이페이지</span>
              </Link>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-2 px-4 py-2 bg-pink-100 text-red-600 rounded-lg font-semibold hover:bg-pink-200 transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span>로그아웃</span>
              </button>
            </nav>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <nav className="w-full flex justify-center space-x-6 text-lg font-medium mt-4 border-b pb-2">
          <Link
            href="/budget"
            className="hover:text-blue-600 hover:underline text-black transition-colors"
          >
            예산관리
          </Link>
          <Link
            href="/statistics"
            className="hover:text-blue-600 hover:underline text-black  transition-colors"
          >
            지출통계
          </Link>
          <Link
            href="/calendar"
            className="hover:text-blue-600 hover:underline text-black transition-colors"
          >
            지출달력
          </Link>
          <Link
            href="/community"
            className="hover:text-blue-600 hover:underline text-black transition-colors"
          >
            커뮤니티
          </Link>
        </nav>
      )}
    </header>
  );
}
