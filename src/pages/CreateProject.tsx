import { useState } from 'react';
import { useNavigate } from 'react-router';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const PROJECT_TYPES = [
  { value: 'presentation', label: '발표' },
  { value: 'report', label: '보고서' },
  { value: 'development', label: '개발' },
  { value: 'design', label: '디자인·기획' },
  { value: 'research', label: '조사·실험' },
  { value: 'other', label: '기타' }
];

export function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    courseName: '',
    deadline: '',
    projectType: 'presentation',
    checkinFrequency: 3,
    checkinDays: ['월', '수', '금'] as string[],
    checkinTime: '23:59',
  });

  const toggleDay = (day: string) => {
    const prev = formData.checkinDays;
    if (prev.includes(day)) {
      setFormData({ ...formData, checkinDays: prev.filter(d => d !== day) });
    } else if (prev.length < formData.checkinFrequency) {
      setFormData({ ...formData, checkinDays: [...prev, day] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/task-onboarding');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">새 프로젝트 생성</h1>
          <p className="text-muted-foreground">팀 프로젝트의 기본 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3>기본 정보</h3>
            <div>
              <label className="block mb-2 text-sm font-medium">프로젝트명</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="예: HCI 기말 발표 과제"
                className="w-full px-4 py-3 bg-muted/30 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">수업명 (선택)</label>
              <input
                type="text"
                value={formData.courseName}
                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="예: 인간컴퓨터상호작용"
                className="w-full px-4 py-3 bg-muted/30 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">최종 마감일</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-muted/30 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                required
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3>프로젝트 유형</h3>
            <div className="grid grid-cols-3 gap-2">
              {PROJECT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, projectType: type.value })}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.projectType === type.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background hover:border-muted-foreground'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3>체크인 설정</h3>
            <div>
              <label className="block mb-2 text-sm font-medium">체크인 주기</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, checkinFrequency: n, checkinDays: [] })}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                      formData.checkinFrequency === n ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="self-center text-sm text-muted-foreground">회/주</span>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                체크인 요일 ({formData.checkinDays.length}/{formData.checkinFrequency} 선택)
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                      formData.checkinDays.includes(d) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">체크인 마감 시간</label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={formData.checkinTime}
                  onChange={e => setFormData({ ...formData, checkinTime: e.target.value })}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                />
                <p className="text-xs text-muted-foreground">마감 이후 제출 시 지각 체크인으로 기록됩니다</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            다음 단계로 →
          </button>
        </form>
      </div>
    </div>
  );
}
