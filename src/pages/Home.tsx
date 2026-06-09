import { useNavigate } from 'react-router';
import { BarChart3, Users, Shield, TrendingUp } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">팀 프로젝트 리스크 관리</span>
          </div>
          <h1 className="mb-4 text-5xl">팀플 리스크 레이더</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            대학생 팀 프로젝트에서 무임승차·역할 불균형·병목·체크인 누락·마감 위험을 조기에 감지하고
            "무엇이 왜 위험한지"를 설명해주는 서비스
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              팀장으로 프로젝트 시작하기
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-card border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              팀원으로 참여하기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-16">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="w-12 h-12 rounded-lg bg-risk-safe/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" style={{ color: 'oklch(0.65 0.15 145)' }} />
            </div>
            <h3 className="mb-2">리스크 조기 감지</h3>
            <p className="text-sm text-muted-foreground">
              작업 지연, 역할 편중, 체크인 누락을 자동으로 감지하고 경고합니다
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="w-12 h-12 rounded-lg bg-risk-watch/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" style={{ color: 'oklch(0.65 0.12 220)' }} />
            </div>
            <h3 className="mb-2">1분 체크인</h3>
            <p className="text-sm text-muted-foreground">
              팀원들은 간단한 체크인만으로 진행 상황을 공유할 수 있습니다
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="w-12 h-12 rounded-lg bg-risk-caution/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" style={{ color: 'oklch(0.65 0.14 85)' }} />
            </div>
            <h3 className="mb-2">실행 가능한 인사이트</h3>
            <p className="text-sm text-muted-foreground">
              단순 경고가 아닌 "무엇이 왜 위험한지"와 "어떻게 해결할지"를 제안합니다
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="mb-6 text-center">빠른 둘러보기</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left"
            >
              <h3 className="mb-2">팀장 대시보드</h3>
              <p className="text-sm text-muted-foreground">
                리스크 점수, 병목 작업, 역할 편중 현황을 한눈에 확인
              </p>
            </button>

            <button
              onClick={() => navigate('/checkin')}
              className="p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left"
            >
              <h3 className="mb-2">팀원 체크인</h3>
              <p className="text-sm text-muted-foreground">
                1분 안에 작업 진행 상황과 어려움을 공유
              </p>
            </button>

            <button
              onClick={() => navigate('/task/2')}
              className="p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left"
            >
              <h3 className="mb-2">작업 상세</h3>
              <p className="text-sm text-muted-foreground">
                각 작업이 왜 위험한지, 어떻게 해결할지 확인
              </p>
            </button>

            <button
              onClick={() => navigate('/report')}
              className="p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left"
            >
              <h3 className="mb-2">최종 리포트</h3>
              <p className="text-sm text-muted-foreground">
                팀원별 참여 요약과 산출물 근거를 자동 생성
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
