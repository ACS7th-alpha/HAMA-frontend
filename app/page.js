'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import Loading from './components/Loading';
import HeroSection from './components/HeroSection';
import ConsumptionAnalysis from './components/ConsumptionAnalysis';
import ProductRecommendations from './components/ProductRecommendations';
import Footer from './components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [childAge, setChildAge] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(0);

  useEffect(() => {
    setLoading(false);
    // URL에서 회원가입 완료 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const signupComplete = urlParams.get('signupComplete');
    const token = urlParams.get('token');

    if (signupComplete && token) {
      // 토큰 저장 및 자동 로그인 처리
      localStorage.setItem('access_token', token);
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, '/');
    }

    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      if (userData && accessToken) {
        const parsedUser = JSON.parse(userData);
        setUserInfo(parsedUser);

        // 아기의 개월 수 계산
        if (parsedUser.children && parsedUser.children[0]) {
          const birthDate = new Date(parsedUser.children[0].birthdate);
          const today = new Date();
          const monthDiff =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
          setChildAge(monthDiff);
        }

        // 지출 내역 조회 및 현재 월 지출액 계산
        try {
          const response = await fetch(
            'http://localhost:3005/budget/spending',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const spendingData = await response.json();

            // 현재 년월 구하기
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 현재 월의 지출액만 필터링하여 합산
            let currentMonthTotal = 0;
            spendingData.spending.forEach((category) => {
              if (category.details && Array.isArray(category.details)) {
                category.details.forEach((detail) => {
                  const spendingDate = new Date(detail.date);
                  if (
                    spendingDate.getFullYear() === currentYear &&
                    spendingDate.getMonth() === currentMonth
                  ) {
                    currentMonthTotal += detail.amount;
                  }
                });
              }
            });

            setMonthlySpending(currentMonthTotal);
          } else {
            console.warn('지출 내역을 가져오는데 실패했습니다.');
            setMonthlySpending(0);
          }
        } catch (error) {
          console.error('Error fetching spending:', error);
          setMonthlySpending(0);
        }
      }
    };

    fetchData();
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('1. Google 로그인 응답:', credentialResponse);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('2. 디코드된 Google 정보:', decoded);

      const response = await fetch('http://localhost:3001/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: decoded.sub,
        }),
      });

      const data = await response.json();
      console.log('3. 백엔드 로그인 응답:', data);

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload(); // 페이지 새로고침하여 헤더 상태 업데이트
      } else {
        const userData = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
        router.push(
          `/signup?userData=${encodeURIComponent(JSON.stringify(userData))}`
        );
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogin={handleGoogleSuccess} />
      <HeroSection
        userInfo={userInfo}
        childAge={childAge}
        monthlySpending={monthlySpending}
      />
      <ConsumptionAnalysis />
      <ProductRecommendations />
      <Footer />
    </div>
  );
}
