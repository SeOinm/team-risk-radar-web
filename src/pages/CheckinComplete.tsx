import { useNavigate } from 'react-router';
import { CheckCircle2, Clock, Calendar, AlertTriangle } from 'lucide-react';

export function CheckinComplete() {
  const navigate = useNavigate();
  const isLate = false; // 지각 여부
  const updatedCount = 1;
  const totalCount = 2;
  const nextCheckinDate = '6월 9일 (월)';

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* 완료 아이콘 */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isLate ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          {isLate ? (
            <Clock className="w-10 h-10 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          )}
        </div>

        <h2 className="mb-2">
          {isLate ? '지각 체크인 완료' : '체크인 완료!'}
        </h2>
        <p className="text-muted-foreground mb-2">
          {isLate
            ? '마감 시간 이후 체크인이 기록되었습니다.'
            : '오늘의 체크인이 기록되었습니다.'}
        </p>

        {isLate && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5" />
            지각 체크인으로 기록됩니다
          </div>
        )}

        {/* 미업데이트 작업 안내 */}
        {updatedCount < totalCount && (
          <div className="w-full mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">일부 작업 미업데이트</p>
                <p className="text-xs text-amber-700">
                  체크인 {totalCount}개 중 {updatedCount}개 완료했습니다.
                  나머지 작업은 다음 체크인 때 업데이트해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 다음 체크인 일정 */}
        <div className="w-full mb-8 p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 justify-center">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">다음 체크인</p>
          </div>
          <p className="font-semibold mt-1">{nextCheckinDate}</p>
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={() => navigate('/member-home')}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            홈으로 이동
          </button>
          <button
            onClick={() => navigate('/my-record')}
            className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            내 기록 보기
          </button>
        </div>
      </div>
    </div>
  );
}
