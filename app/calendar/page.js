'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko'; // 한국어 로케일

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [allSpending, setAllSpending] = useState([]); // 전체 지출 내역 저장
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [spendingAmount, setSpendingAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateSpending, setSelectedDateSpending] = useState([]);
  const [dailySpending, setDailySpending] = useState({}); // 추가: 일별 지출 내역
  const [monthlySpending, setMonthlySpending] = useState(0); // 추가: 월별 총 지출액

  // 전체 지출 내역 조회
  useEffect(() => {
    const fetchAllSpending = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.log('No access token found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3005/budget/spending', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 404) {
          // 데이터가 없는 경우 정상적으로 처리
          console.log('No spending data found');
          setAllSpending([]);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch spending data');
        }

        const data = await response.json();
        if (data) {
          setAllSpending(data.spending || []); // 전체 지출 내역 저장
        }
      } catch (error) {
        console.error('Error fetching spending data:', error);
        setAllSpending([]); // 에러 발생 시 빈 배열로 초기화
      } finally {
        setLoading(false);
      }
    };

    fetchAllSpending();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 현재 선택된 월의 지출 데이터 계산
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 현재 월의 지출 데이터 필터링
    const currentMonthSpending = {};
    let totalMonthSpending = 0;

    allSpending.forEach((categoryData) => {
      if (categoryData.details && Array.isArray(categoryData.details)) {
        categoryData.details.forEach((detail) => {
          const spendingDate = new Date(detail.date);
          if (
            spendingDate.getFullYear() === year &&
            spendingDate.getMonth() === month
          ) {
            const day = spendingDate.getDate();
            if (!currentMonthSpending[day]) {
              currentMonthSpending[day] = [];
            }
            currentMonthSpending[day].push({
              ...detail,
              category: categoryData.category,
            });
            totalMonthSpending += detail.amount;
          }
        });
      }
    });

    setDailySpending(currentMonthSpending);
    setMonthlySpending(totalMonthSpending);
  }, [currentDate, allSpending]); // currentDate나 allSpending이 변경될 때만 실행

  // 월 이동 핸들러 수정
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    // 지출 내역 초기화
    setSelectedDateSpending([]);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    // 지출 내역 초기화
    setSelectedDateSpending([]);
  };

  // 달력 데이터 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 해당 월의 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력에 표시할 날짜들
    const days = [];

    // 첫 주의 시작 부분을 빈 칸으로 채우기
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // 실제 날짜 채우기
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  // 카테고리 매핑 함수
  const getCategoryValue = (category) => {
    const categoryMap = {
      '기저귀/물티슈': 'diaper',
      '생활/위생용품': 'sanitary',
      '수유/이유용품': 'feeding',
      '스킨케어/화장품': 'skincare',
      식품: 'food',
      완구용품: 'toys',
      침구류: 'bedding',
      '패션의류/잡화': 'fashion',
      기타: 'other',
    };
    return categoryMap[category] || 'other';
  };

  // 지출 등록 핸들러 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !productName || !spendingAmount) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 선택된 날짜의 시간을 현지 시간 정오로 설정
      const localDate = new Date(selectedDate);
      localDate.setHours(12, 0, 0, 0);

      const requestBody = {
        date: localDate.toISOString().split('T')[0], // 현지 시간 기준으로 날짜 변환
        category: getCategoryValue(selectedCategory),
        itemName: productName,
        amount: parseInt(spendingAmount),
      };

      const response = await fetch('http://localhost:3005/budget/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        // 전체 지출 내역 다시 가져오기
        const spendingResponse = await fetch(
          'http://localhost:3005/budget/spending',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (spendingResponse.ok) {
          const spendingData = await spendingResponse.json();
          setAllSpending(spendingData.spending || []); // 전체 지출 내역 업데이트

          // 현재 날짜의 지출 내역도 업데이트
          const day = selectedDate.getDate();
          const newSpending = {
            date: selectedDate,
            category: selectedCategory,
            itemName: productName,
            amount: parseInt(spendingAmount),
          };

          setDailySpending((prev) => ({
            ...prev,
            [day]: [...(prev[day] || []), newSpending],
          }));

          // 월별 총 지출액 업데이트
          setMonthlySpending((prev) => prev + parseInt(spendingAmount));
        }

        // 폼 초기화
        setSelectedCategory('');
        setProductName('');
        setSpendingAmount('');

        alert('지출이 등록되었습니다.');
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        alert('지출 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  // 카테고리 이름 변환 함수
  const getCategoryName = (category) => {
    const categoryMap = {
      diaper: '기저귀/물티슈',
      sanitary: '생활/위생용품',
      feeding: '수유/이유용품',
      skincare: '스킨케어/화장품',
      food: '식품',
      toys: '완구용품',
      bedding: '침구류',
      fashion: '패션의류/잡화',
      other: '기타',
    };
    return categoryMap[category] || category;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    setSelectedDateSpending(dailySpending[day] || []);
  };

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();
    const weeks = [];
    let week = [];

    days.forEach((day) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <th key={day} className="p-2 border-b text-center text-black">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={`week-${weekIndex}`}>
              {week.map((day, dayIndex) => (
                <td
                  key={`${weekIndex}-${dayIndex}`}
                  className={`p-4 border text-center ${
                    day ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: '14.28%' }}
                  onClick={() => handleDateClick(day)}
                >
                  {day && (
                    <div className="min-h-[80px] flex flex-col items-center">
                      <span className="text-sm font-medium text-black mb-3">
                        {day}
                      </span>
                      {dailySpending[day] && dailySpending[day].length > 0 && (
                        <span className="text-base text-red-500 text-center">
                          {dailySpending[day]
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}{' '}
                          원
                        </span>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const user = JSON.parse(localStorage.getItem('user')); // 로컬 저장소에서 사용자 데이터 가져오기

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* 달력 헤더 */}
          <div className="flex justify-center items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-xl font-semibold text-black mx-4">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* 예산 및 지출 요약 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-black">예산</h3>
              <p className="text-2xl font-bold text-blue-600">
                {user?.monthlyBudget?.toLocaleString() || 0}원
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-black">지출</h3>
              <p className="text-2xl font-bold text-red-600">
                {monthlySpending?.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 달력 */}
          <div className="overflow-x-auto">{renderCalendar()}</div>

          {/* 달력 이후 추가되는 섹션 */}
          <div className="mt-8 space-y-8">
            {/* 지출 내역 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4 text-black">지출 내역</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        상품
                      </th>
                      <th className="px-6 py-3 text-right text-black font-semibold">
                        지출
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedDate && selectedDateSpending.length > 0 ? (
                      selectedDateSpending.map((spending, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-black">
                            {currentDate.getMonth() + 1}월{' '}
                            {selectedDate.getDate()}일
                          </td>
                          <td className="px-6 py-4 text-black">
                            {getCategoryName(spending.category)}
                          </td>
                          <td className="px-6 py-4 text-black">
                            {spending.itemName}
                          </td>
                          <td className="px-6 py-4 text-right text-red-600">
                            {spending.amount?.toLocaleString()}원
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          {selectedDate
                            ? '해당 날짜의 지출 내역이 없습니다.'
                            : '날짜를 선택하면 상세 내역이 표시됩니다.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 지출 등록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4 text-black">지출 등록</h3>
              <form
                onSubmit={handleSubmit}
                className="mt-4 bg-white p-4 rounded shadow-md"
              >
                <div className="mb-6">
                  <label className="block text-black font-medium mb-2 text-lg">
                    구매 날짜
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    className="border p-2 rounded w-full text-black"
                    placeholderText="날짜 선택"
                    showTimeSelect={false}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-black font-medium mb-2 text-lg">
                    카테고리
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border p-2 rounded w-full text-black"
                  >
                    <option value="">카테고리 선택</option>
                    <option value="기저귀/물티슈">기저귀/물티슈</option>
                    <option value="생활/위생용품">생활/위생용품</option>
                    <option value="수유/이유용품">수유/이유용품</option>
                    <option value="스킨케어/화장품">스킨케어/화장품</option>
                    <option value="식품">식품</option>
                    <option value="완구용품">완구용품</option>
                    <option value="침구류">침구류</option>
                    <option value="패션의류/잡화">패션의류/잡화</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-black font-medium mb-2 text-lg">
                    상품명
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="border p-2 rounded w-full text-black"
                    placeholder="상품명을 입력하세요"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-black font-medium mb-2 text-lg">
                    지출 금액
                  </label>
                  <input
                    type="number"
                    value={spendingAmount}
                    onChange={(e) => setSpendingAmount(e.target.value)}
                    className="border p-2 rounded w-full text-black"
                    placeholder="금액을 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
