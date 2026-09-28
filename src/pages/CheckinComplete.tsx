import { useNavigate } from 'react-router';
import { Calendar } from 'lucide-react';
import { Btn, AlertBanner } from '@/components/ds';

export function CheckinComplete() {
  const navigate = useNavigate();
  const isLate = false;
  const updatedCount = 1;
  const totalCount = 2;
  const nextCheckinDate = '6월 9일 (월)';

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        {/* Status icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isLate ? 'bg-[#FFFBEB]' : 'bg-[#F0FDF4]'}`}>
          <span className="text-[28px]">{isLate ? '⏱' : '✓'}</span>
        </div>

        <p className="text-[18px] font-semibold text-[#111827] mb-1">
          {isLate ? '지각 체크인 완료' : '체크인 완료'}
        </p>
        <p className="text-[13px] text-[#6B7280] mb-5">
          {isLate
            ? '마감 시간 이후 체크인이 기록되었습니다.'
            : '오늘의 체크인이 기록되었습니다.'}
        </p>

        {isLate && (
          <div className="w-full mb-4">
            <AlertBanner level="caution" title="지각 체크인으로 기록됩니다" />
          </div>
        )}

        {updatedCount < totalCount && (
          <div className="w-full mb-4">
            <AlertBanner
              level="caution"
              title={`일부 작업 미업데이트 (${updatedCount}/${totalCount})`}
              desc="나머지 작업은 다음 체크인 때 업데이트해주세요."
            />
          </div>
        )}

        {/* Next checkin */}
        <div className="w-full mb-8 border border-[#E5E7EB] rounded-md p-4">
          <div className="flex items-center gap-2 justify-center text-[12px] text-[#9CA3AF] mb-1">
            <Calendar className="w-3.5 h-3.5" />
            다음 체크인
          </div>
          <p className="text-[15px] font-semibold text-[#111827]">{nextCheckinDate}</p>
        </div>

        <div className="w-full space-y-2">
          <Btn variant="primary" className="w-full h-11 text-[14px]" onClick={() => navigate('/member-home')}>
            홈으로 이동
          </Btn>
          <Btn variant="secondary" className="w-full h-11 text-[14px]" onClick={() => navigate('/my-record')}>
            내 기록 보기
          </Btn>
        </div>
      </div>
    </div>
  );
}
