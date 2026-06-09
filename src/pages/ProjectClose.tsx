import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertOctagon, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { sampleTasks } from '@/data/sampleData';

export function ProjectClose() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  const incompleteCount = sampleTasks.filter(t => t.status !== '완료' && t.status !== '취소').length;
  const unassignedCount = sampleTasks.filter(t => t.assignees.length === 0).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> 설정
          </button>
          <div className="h-4 border-l border-border" />
          <h1 className="text-red-700">프로젝트 종료</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* 종료 영향 안내 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800">종료 후 다음 기능이 비활성화됩니다</h3>
          </div>
          <div className="space-y-2">
            {[
              '체크인 제출',
              '작업 추가 및 수정',
              '담당자 배정 변경',
              '팀원 추가 및 초대',
              '프로젝트 설정 변경',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-red-700">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-red-600">종료 후에도 최종 리포트 조회는 가능합니다.</p>
        </div>

        {/* 현재 상태 요약 */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3>종료 전 현재 상태</h3>
          <div className="space-y-3">
            <StatusItem
              icon={incompleteCount > 0 ? 'warn' : 'ok'}
              label="미완료 작업"
              value={`${incompleteCount}개`}
              note={incompleteCount > 0 ? '완료 또는 취소되지 않은 작업이 있습니다' : '모든 작업이 완료됐습니다'}
            />
            <StatusItem
              icon={unassignedCount > 0 ? 'warn' : 'ok'}
              label="미배정 작업"
              value={`${unassignedCount}개`}
              note={unassignedCount > 0 ? '아직 담당자가 없는 작업이 있습니다' : ''}
            />
            <StatusItem
              icon="warn"
              label="최근 체크인 누락"
              value="1명"
              note="박서연이 2회 연속 체크인하지 않았습니다"
            />
            <StatusItem
              icon="ok"
              label="취소된 작업"
              value="0개"
              note=""
            />
          </div>
        </div>

        {/* 확인 체크박스 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border"
            />
            <p className="text-sm">
              위 내용을 모두 확인했으며, 프로젝트를 종료하면 되돌릴 수 없음을 이해합니다.
            </p>
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="flex-1 py-3 border border-border rounded-xl text-sm"
          >
            취소
          </button>
          <button
            disabled={!confirmed}
            onClick={() => navigate('/projects')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-opacity ${
              confirmed ? 'bg-red-600 text-white hover:opacity-90' : 'bg-red-200 text-red-400 cursor-not-allowed'
            }`}
          >
            프로젝트 종료
          </button>
        </div>
      </main>
    </div>
  );
}

function StatusItem({ icon, label, value, note }: { icon: 'ok' | 'warn'; label: string; value: string; note: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        {icon === 'ok' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
      </div>
      <span className="text-sm font-semibold shrink-0">{value}</span>
    </div>
  );
}
