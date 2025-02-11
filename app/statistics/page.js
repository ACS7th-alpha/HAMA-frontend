'use client';

import { useState, useEffect } from 'react';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import Header from '@/app/components/Header';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required chart components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 카테고리 이름 매핑
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

export default function StatisticsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryData, setCategoryData] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  // 데이터 처리 함수
  const processData = () => {
    const spendingData = JSON.parse(localStorage.getItem('spendingData'));
    if (spendingData) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // 1. 해당 월의 카테고리별 데이터 처리
      const monthlyData = spendingData.spending
        .map((category) => {
          const details = category.details.filter((detail) => {
            const date = new Date(detail.date);
            return date.getFullYear() === year && date.getMonth() === month;
          });

          const totalAmount = details.reduce(
            (sum, detail) => sum + detail.amount,
            0
          );

          return {
            name: categoryMap[category.category] || category.category,
            amount: totalAmount,
            details: details,
          };
        })
        .filter((category) => category.amount > 0);

      setCategoryData(monthlyData);
      setMonthlySpending(
        monthlyData.reduce((sum, category) => sum + category.amount, 0)
      );

      // 2. 연간 데이터 처리
      const yearlyTotals = Array(12).fill(0);
      spendingData.spending.forEach((category) => {
        category.details.forEach((detail) => {
          const date = new Date(detail.date);
          if (date.getFullYear() === year) {
            yearlyTotals[date.getMonth()] += detail.amount;
          }
        });
      });
      setYearlyData(yearlyTotals);
    }
  };

  // 년월 변경 핸들러
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // currentDate가 변경될 때마다 데이터 업데이트
  useEffect(() => {
    processData();
  }, [currentDate]);

  // 초기 마운트 시 예산 정보 가져오기
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setMonthlyBudget(user.monthlyBudget || 0);
    }
  }, []);

  const pieData = {
    labels: categoryData.map((category) => category.name),
    datasets: [
      {
        data: categoryData.map((category) => category.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF9F40',
          '#4BC0C0',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: categoryData.map((category) => category.name),
    datasets: [
      {
        data: categoryData.map((category) => category.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF9F40',
          '#4BC0C0',
        ],
      },
    ],
  };

  // 전체 지출액 대비 카테고리별 비율 계산 함수
  const calculatePercentage = (amount) => {
    if (monthlySpending === 0) return 0;
    return ((amount / monthlySpending) * 100).toFixed(1);
  };

  // 연간 지출 차트 데이터
  const yearlyChartData = {
    labels: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    datasets: [
      {
        label: '월별 지출',
        data: yearlyData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: '월별 예산',
        data: Array(12).fill(monthlyBudget),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        type: 'line',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full relative">
          {/* 년월 선택 부분 */}
          <div className="flex justify-center items-center mb-8 mt-8">
            <div className="flex items-center gap-4">
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
              <span className="text-xl font-semibold text-black">
                {currentDate.getFullYear()}년{' '}
                {String(currentDate.getMonth() + 1).padStart(2, '0')}월
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
          </div>

          {/* 도넛 차트 섹션 */}
          <div className="bg-white rounded-lg p-6 shadow-md mt-8">
            <div className="flex flex-col items-center">
              <div style={{ width: '400px', height: '400px' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                            color: 'black',
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-black text-center">
                  총 지출: {monthlySpending.toLocaleString()}원
                </h3>
              </div>
            </div>
          </div>

          {/* 카테고리별 지출 내역 */}
          <div className="bg-white rounded-lg p-4 shadow-md mt-6 max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-2">
              카테고리별 지출 내역
            </h3>
            {categoryData.map((category, index) => (
              <div key={index} className="mb-4">
                {/* 카테고리 헤더 */}
                <div className="flex justify-between items-center py-1 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-black text-xl font-medium">
                      {category.name}
                    </span>
                    <span className="text-gray-600 text-lg">
                      {calculatePercentage(category.amount)}%
                    </span>
                  </div>
                  <span className="text-black text-xl font-medium">
                    {category.amount.toLocaleString()}원
                  </span>
                </div>

                {/* 세부 내역 */}
                {category.details &&
                  category.details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      className="flex justify-between py-1 pl-2 text-lg border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 min-w-[60px]">
                          {new Date(detail.date).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </span>
                        <span className="text-black">{detail.itemName}</span>
                      </div>
                      <span className="text-black">
                        {detail.amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* 연간 지출 내역 */}
          <div className="bg-white rounded-lg p-6 shadow-md mt-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-4">
              {currentDate.getFullYear()}년 연간 지출 내역
            </h3>
            <div className="h-[400px]">
              <Bar
                data={yearlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${value.toLocaleString()}원`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y;
                          return `${label}: ${value.toLocaleString()}원`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                월별 예산: {monthlyBudget.toLocaleString()}원
              </p>
              <p className="text-gray-600">
                연간 총 지출:{' '}
                {yearlyData.reduce((a, b) => a + b, 0).toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
