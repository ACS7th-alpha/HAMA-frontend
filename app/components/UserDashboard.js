export default function UserDashboard({ userInfo, childAge }) {
    return (
      <div className="bg-gradient-to-b from-pink-50 to-yellow-50 w-full">
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
                      {userInfo.monthlyBudget?.toLocaleString()}원
                    </p>
                  </div>
                  <div className="w-full h-5 bg-white rounded-full overflow-hidden mt-4 shadow-inner">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 text-gray-600">
                    <span className="flex items-center">
                      <span className="mr-1">💸</span> 사용: 594,000원
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">✨</span> 남은: 396,000원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }