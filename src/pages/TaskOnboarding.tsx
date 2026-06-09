import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  size?: 'S' | 'M' | 'L' | 'XL';
  assignee?: string;
  deadline?: string;
  dependencies?: string[];
}

const initialTasks: Task[] = [
  { id: '1', name: '주제 확정' },
  { id: '2', name: '자료 조사' },
  { id: '3', name: '보고서 초안' },
  { id: '4', name: '발표자료 제작' },
  { id: '5', name: '발표 대본 작성' },
  { id: '6', name: '리허설' },
  { id: '7', name: '최종 제출' }
];

const teamMembers = ['김지훈', '박서연', '이도현', '최유진'];

export function TaskOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const workloadWarning = calculateWorkloadWarning(tasks);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepTemplate tasks={tasks} setTasks={setTasks} />;
      case 2:
        return <StepTaskList tasks={tasks} setTasks={setTasks} />;
      case 3:
        return <StepSize tasks={tasks} setTasks={setTasks} />;
      case 4:
        return <StepAssignee tasks={tasks} setTasks={setTasks} warning={workloadWarning} />;
      case 5:
        return <StepDeadline tasks={tasks} setTasks={setTasks} />;
      case 6:
        return <StepDependencies tasks={tasks} setTasks={setTasks} />;
      case 7:
        return <StepPreview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-2 rounded-full flex-1 transition-all ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {step}단계 / 7단계
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8">
          {renderStep()}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                이전
              </button>
            )}
            <button
              onClick={() => {
                if (step === 7) {
                  navigate('/invite-team');
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {step === 7 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTemplate(_props: any) {
  return (
    <div>
      <h2 className="mb-4">작업 템플릿 선택</h2>
      <p className="text-muted-foreground mb-6">프로젝트 유형에 맞는 추천 작업 목록으로 시작하세요</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '발표 프로젝트 (추천)', sub: '주제 확정, 자료 조사, 보고서, 발표자료, 연습 등 7개', selected: true },
          { label: '보고서 프로젝트', sub: '자료 수집, 초안 작성, 검토, 최종 제출 등 5개', selected: false },
          { label: '개발 프로젝트', sub: '요구분석, 설계, 구현, 테스트, 배포 등 6개', selected: false },
          { label: '디자인·기획', sub: '리서치, 와이어프레임, 디자인, 피드백 등 5개', selected: false },
          { label: '조사·실험', sub: '가설 설정, 데이터 수집, 분석, 정리 등 5개', selected: false },
          { label: '처음부터 만들기', sub: '빈 작업 목록으로 시작', selected: false },
        ].map(t => (
          <button key={t.label} className={`p-4 rounded-xl border-2 text-left transition-colors ${t.selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
            <p className="font-medium text-sm mb-1">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTaskList({ tasks, setTasks }: any) {
  return (
    <div>
      <h2 className="mb-4">작업 목록</h2>
      <p className="text-muted-foreground mb-6">필요한 작업을 추가하거나 수정하세요</p>
      <div className="space-y-2 mb-4">
        {tasks.map((task: Task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <input
              type="text"
              value={task.name}
              onChange={(e) => {
                setTasks(tasks.map((t: Task) =>
                  t.id === task.id ? { ...t, name: e.target.value } : t
                ));
              }}
              className="flex-1 bg-transparent border-0 outline-none"
            />
          </div>
        ))}
      </div>
      <button className="text-sm text-primary">+ 작업 추가</button>
    </div>
  );
}

function StepSize({ tasks, setTasks }: any) {
  return (
    <div>
      <h2 className="mb-4">작업 크기 설정</h2>
      <p className="text-muted-foreground mb-6">각 작업의 예상 소요 시간을 선택하세요</p>
      <div className="space-y-4">
        {tasks.slice(0, 3).map((task: Task) => (
          <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <span>{task.name}</span>
            <div className="flex gap-2">
              {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setTasks(tasks.map((t: Task) =>
                      t.id === task.id ? { ...t, size } : t
                    ));
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    task.size === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border hover:border-muted-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAssignee({ tasks, setTasks, warning }: any) {
  return (
    <div>
      <h2 className="mb-4">담당자 지정</h2>
      <p className="text-muted-foreground mb-6">각 작업의 담당자를 선택하세요</p>

      {warning && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-risk-caution/10 border border-risk-caution/30">
          <AlertCircle className="w-5 h-5 text-risk-caution shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'oklch(0.35 0.12 85)' }}>
            {warning}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-3">담당자를 지정하지 않아도 됩니다. 나중에 작업 보드에서 배정할 수 있습니다.</p>
      <div className="space-y-3">
        {tasks.slice(0, 3).map((task: Task) => (
          <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <span>{task.name}</span>
            <select
              value={task.assignee || ''}
              onChange={(e) => {
                setTasks(tasks.map((t: Task) =>
                  t.id === task.id ? { ...t, assignee: e.target.value } : t
                ));
              }}
              className="px-4 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">미배정</option>
              {teamMembers.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepDeadline({ tasks, setTasks }: any) {
  return (
    <div>
      <h2 className="mb-4">마감일 설정</h2>
      <p className="text-muted-foreground mb-6">각 작업의 마감일을 설정하세요</p>
      <div className="space-y-3">
        {tasks.slice(0, 3).map((task: Task) => (
          <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <span>{task.name}</span>
            <input
              type="date"
              value={task.deadline || ''}
              onChange={(e) => {
                setTasks(tasks.map((t: Task) =>
                  t.id === task.id ? { ...t, deadline: e.target.value } : t
                ));
              }}
              className="px-4 py-2 bg-background rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepDependencies({ tasks }: any) {
  return (
    <div>
      <h2 className="mb-4">선행 작업 설정</h2>
      <p className="text-muted-foreground mb-6">이 작업을 시작하려면 먼저 끝나야 하는 작업이 있나요?</p>
      <div className="space-y-3">
        {tasks.slice(2, 5).map((task: Task) => (
          <div key={task.id} className="p-4 rounded-lg bg-accent/50">
            <div className="mb-3 font-medium">{task.name}</div>
            <div className="flex flex-wrap gap-2">
              {tasks.filter((t: Task) => t.id !== task.id).slice(0, 3).map((t: Task) => (
                <button
                  key={t.id}
                  className="px-3 py-1.5 rounded-lg text-sm border border-border bg-background hover:border-primary transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPreview() {
  return (
    <div>
      <h2 className="mb-4">초기 리스크 미리보기</h2>
      <p className="text-muted-foreground mb-6">설정한 작업 구조를 분석했습니다</p>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border-2 border-risk-danger/30 bg-risk-danger/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-risk-danger shrink-0 mt-0.5" />
            <div>
              <h3 className="mb-1">발표자료 제작이 핵심 병목입니다</h3>
              <p className="text-sm text-muted-foreground">
                이 작업이 지연되면 전체 일정에 영향을 줄 수 있습니다
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="mb-3">권장 사항</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 발표자료 제작에 충분한 시간을 확보하세요</li>
            <li>• 자료 조사와 보고서 초안을 먼저 완료하세요</li>
            <li>• 팀원 간 작업량이 고르게 분배되었는지 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function calculateWorkloadWarning(tasks: Task[]): string | null {
  const workload = tasks.reduce((acc, task) => {
    if (task.assignee) {
      acc[task.assignee] = (acc[task.assignee] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const maxWorkload = Math.max(...Object.values(workload));
  const totalTasks = tasks.filter(t => t.assignee).length;

  if (maxWorkload > 0 && totalTasks > 0) {
    const percentage = Math.round((maxWorkload / totalTasks) * 100);
    const assignee = Object.entries(workload).find(([_, count]) => count === maxWorkload)?.[0];
    if (percentage > 40 && assignee) {
      return `${assignee}이 전체 작업량의 ${percentage}%를 담당하고 있습니다`;
    }
  }

  return null;
}
