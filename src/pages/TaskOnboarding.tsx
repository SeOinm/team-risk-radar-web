import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Btn, AlertBanner, NavBack } from '@/components/ds';

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
  { id: '7', name: '최종 제출' },
];

const TEAM_MEMBERS = ['김지훈', '박서연', '이도현', '최유진'];

const TEMPLATES = [
  { label: '발표 프로젝트 (추천)', sub: '주제 확정, 자료 조사, 보고서, 발표자료 등 7개', tasks: initialTasks },
  { label: '보고서 프로젝트', sub: '자료 수집, 초안 작성, 검토, 최종 제출 등 5개', tasks: initialTasks.slice(0, 5) },
  { label: '개발 프로젝트', sub: '요구분석, 설계, 구현, 테스트, 배포 등 6개', tasks: initialTasks.slice(0, 6) },
  { label: '디자인·기획', sub: '리서치, 와이어프레임, 디자인, 피드백 등 5개', tasks: initialTasks.slice(0, 5) },
  { label: '조사·실험', sub: '가설 설정, 데이터 수집, 분석, 정리 등 5개', tasks: initialTasks.slice(0, 5) },
  { label: '처음부터 만들기', sub: '빈 작업 목록으로 시작', tasks: [] },
];

const STEP_LABELS = ['템플릿', '작업 목록', '크기', '담당자', '마감일', '선행 작업', '미리보기'];

function calculateWorkloadWarning(tasks: Task[]): string | null {
  const workload = tasks.reduce((acc, task) => {
    if (task.assignee) {
      acc[task.assignee] = (acc[task.assignee] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const maxWorkload = Math.max(...Object.values(workload), 0);
  const totalTasks = tasks.filter(t => t.assignee).length;
  if (maxWorkload > 0 && totalTasks > 0) {
    const percentage = Math.round((maxWorkload / totalTasks) * 100);
    const assignee = Object.entries(workload).find(([, count]) => count === maxWorkload)?.[0];
    if (percentage > 40 && assignee) {
      return `${assignee}이 전체 작업량의 ${percentage}%를 담당하고 있습니다`;
    }
  }
  return null;
}

export function TaskOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const workloadWarning = calculateWorkloadWarning(tasks);

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1
              ? <NavBack label="이전" onClick={() => setStep(s => s - 1)} />
              : <NavBack label="프로젝트 만들기" onClick={() => navigate('/create-project')} />
            }
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">작업 설정</span>
          </div>
          <span className="text-[12px] text-[#9CA3AF]">{step} / 7</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[#F3F4F6]">
        <div
          className="h-full bg-[#111827] transition-all duration-300"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Step label */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
            {step}단계
          </span>
          <span className="text-[11px] text-[#9CA3AF]">·</span>
          <span className="text-[11px] text-[#6B7280]">{STEP_LABELS[step - 1]}</span>
        </div>

        {step === 1 && (
          <StepTemplate
            tasks={tasks}
            setTasks={setTasks}
            selected={selectedTemplate}
            setSelected={setSelectedTemplate}
          />
        )}
        {step === 2 && <StepTaskList tasks={tasks} setTasks={setTasks} />}
        {step === 3 && <StepSize tasks={tasks} setTasks={setTasks} />}
        {step === 4 && <StepAssignee tasks={tasks} setTasks={setTasks} warning={workloadWarning} />}
        {step === 5 && <StepDeadline tasks={tasks} setTasks={setTasks} />}
        {step === 6 && <StepDependencies tasks={tasks} setTasks={setTasks} />}
        {step === 7 && <StepPreview />}

        <div className="flex gap-2 mt-6 pt-4 border-t border-[#E5E7EB]">
          {step > 1 && (
            <Btn variant="secondary" className="h-10 px-5" onClick={() => setStep(s => s - 1)}>
              이전
            </Btn>
          )}
          <Btn
            variant="primary"
            className="flex-1 h-10"
            onClick={() => {
              if (step === 7) navigate('/invite-team');
              else setStep(s => s + 1);
            }}
          >
            {step === 7 ? '완료 및 팀원 초대 →' : '다음 단계 →'}
          </Btn>
        </div>
      </main>
    </div>
  );
}

function SectionShell({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-[#111827] mb-0.5">{title}</p>
      {desc && <p className="text-[12px] text-[#9CA3AF] mb-4">{desc}</p>}
      {children}
    </div>
  );
}

function StepTemplate({ setTasks, selected, setSelected }: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  selected: number;
  setSelected: (i: number) => void;
}) {
  return (
    <SectionShell title="작업 템플릿 선택" desc="프로젝트 유형에 맞는 추천 작업 목록으로 시작하세요">
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.label}
            onClick={() => { setSelected(i); setTasks(t.tasks); }}
            className={`p-3.5 rounded-md border text-left transition-colors ${
              selected === i
                ? 'border-[#111827] bg-[#111827] text-white'
                : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            <p className="text-[13px] font-medium mb-0.5">{t.label}</p>
            <p className={`text-[11px] ${selected === i ? 'text-[#D1D5DB]' : 'text-[#9CA3AF]'}`}>{t.sub}</p>
          </button>
        ))}
      </div>
    </SectionShell>
  );
}

function StepTaskList({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const addTask = () => {
    const id = String(Date.now());
    setTasks([...tasks, { id, name: '' }]);
  };
  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const updateName = (id: string, name: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, name } : t));

  return (
    <SectionShell title="작업 목록" desc="필요한 작업을 추가하거나 수정하세요">
      <div className="border border-[#E5E7EB] rounded-md overflow-hidden mb-3">
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-[12px] text-[#9CA3AF]">
            작업을 추가해주세요
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {tasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-[11px] text-[#9CA3AF] w-5 shrink-0">{i + 1}</span>
                <input
                  type="text"
                  value={task.name}
                  onChange={e => updateName(task.id, e.target.value)}
                  placeholder="작업 이름"
                  className="flex-1 text-[13px] text-[#111827] bg-transparent outline-none placeholder:text-[#D1D5DB]"
                />
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-[#D1D5DB] hover:text-[#9CA3AF] shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={addTask}
        className="flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827]"
      >
        <Plus className="w-3.5 h-3.5" /> 작업 추가
      </button>
    </SectionShell>
  );
}

function StepSize({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const updateSize = (id: string, size: Task['size']) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, size } : t));

  return (
    <SectionShell title="작업 크기 설정" desc="각 작업의 예상 소요 시간을 선택하세요 (S: 1시간 미만 / M: 반나절 / L: 하루 / XL: 여러 날)">
      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <span className="text-[11px] font-semibold text-[#9CA3AF]">작업</span>
          <span className="text-[11px] font-semibold text-[#9CA3AF]">크기</span>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[13px] text-[#111827]">{task.name}</span>
              <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updateSize(task.id, size)}
                    className={`px-2.5 h-7 rounded text-[11px] font-semibold border transition-colors ${
                      task.size === size
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
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
    </SectionShell>
  );
}

function StepAssignee({ tasks, setTasks, warning }: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  warning: string | null;
}) {
  const updateAssignee = (id: string, assignee: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, assignee: assignee || undefined } : t));

  return (
    <SectionShell title="담당자 지정" desc="지금 지정하지 않아도 됩니다. 나중에 작업 보드에서 배정할 수 있습니다.">
      {warning && (
        <div className="flex items-start gap-2.5 border border-[#FDE68A] bg-[#FFFBEB] rounded-md px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#78350F]">{warning}</p>
        </div>
      )}
      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <span className="text-[11px] font-semibold text-[#9CA3AF]">작업</span>
          <span className="text-[11px] font-semibold text-[#9CA3AF]">담당자</span>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[13px] text-[#111827]">{task.name}</span>
              <select
                value={task.assignee || ''}
                onChange={e => updateAssignee(task.id, e.target.value)}
                className="h-7 px-2 text-[12px] border border-[#E5E7EB] rounded-md bg-white outline-none focus:ring-1 focus:ring-[#111827] text-[#374151]"
              >
                <option value="">미배정</option>
                {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function StepDeadline({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const updateDeadline = (id: string, deadline: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, deadline: deadline || undefined } : t));

  return (
    <SectionShell title="마감일 설정" desc="각 작업의 목표 완료 날짜를 입력하세요. 최종 마감일을 넘으면 경고합니다.">
      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <span className="text-[11px] font-semibold text-[#9CA3AF]">작업</span>
          <span className="text-[11px] font-semibold text-[#9CA3AF]">마감일</span>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-[13px] text-[#111827]">{task.name}</span>
              <input
                type="date"
                value={task.deadline || ''}
                onChange={e => updateDeadline(task.id, e.target.value)}
                className="h-7 px-2 text-[12px] border border-[#E5E7EB] rounded-md bg-white outline-none focus:ring-1 focus:ring-[#111827] text-[#374151]"
              />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function StepDependencies({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const toggleDep = (taskId: string, depId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const deps = t.dependencies || [];
      return {
        ...t,
        dependencies: deps.includes(depId)
          ? deps.filter(d => d !== depId)
          : [...deps, depId],
      };
    }));
  };

  const candidates = tasks.slice(0, Math.min(tasks.length - 1, 5));

  return (
    <SectionShell title="선행 작업 설정" desc="이 작업을 시작하려면 먼저 끝나야 하는 작업을 선택하세요. 설정하지 않아도 됩니다.">
      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="divide-y divide-[#E5E7EB]">
          {tasks.slice(1).map(task => (
            <div key={task.id} className="px-4 py-3">
              <p className="text-[13px] font-medium text-[#111827] mb-2">{task.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {candidates
                  .filter(c => c.id !== task.id)
                  .map(c => {
                    const active = (task.dependencies || []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleDep(task.id, c.id)}
                        className={`px-2.5 h-6 rounded text-[11px] border transition-colors ${
                          active
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function StepPreview() {
  return (
    <SectionShell title="초기 리스크 미리보기" desc="설정한 작업 구조를 분석했습니다">
      <AlertBanner
        level="danger"
        title="발표자료 제작이 핵심 병목입니다"
        desc="이 작업이 지연되면 전체 일정에 영향을 줄 수 있습니다"
      />
      <div className="mt-4 border border-[#E5E7EB] rounded-md overflow-hidden">
        <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <span className="text-[12px] font-semibold text-[#374151]">권장 사항</span>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {[
            '발표자료 제작에 충분한 시간을 확보하세요',
            '자료 조사와 보고서 초안을 먼저 완료하세요',
            '팀원 간 작업량이 고르게 분배되었는지 확인하세요',
          ].map(item => (
            <div key={item} className="flex items-start gap-2.5 px-5 py-3">
              <span className="text-[#9CA3AF] text-[12px] mt-0.5">·</span>
              <p className="text-[12px] text-[#374151]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
