import { useRef, useState, type FormEvent } from 'react';
import { projectsApi, DAY_LABELS, type CheckinDay } from '@/api/projects';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/context';
import { useNavigate } from 'react-router';
import { Btn, Input, NavBack } from '@/components/ds';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const PROJECT_TYPES = [
  { value: 'presentation', label: '발표' },
  { value: 'report', label: '보고서' },
  { value: 'development', label: '개발' },
  { value: 'design', label: '디자인·기획' },
  { value: 'research', label: '조사·실험' },
  { value: 'other', label: '기타' },
];

export function CreateProject() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    projectName: '',
    courseName: '',
    deadline: '',
    projectType: 'presentation',
    checkinFrequency: 3,
    checkinDays: ['월', '수', '금'] as string[],
    checkinTime: '23:59',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    setFieldErrors({});
    if (!formData.projectName.trim()) { setError('프로젝트명을 입력해주세요.'); return; }
    if (formData.checkinDays.length !== formData.checkinFrequency) { setError('체크인 주기와 선택한 요일 수를 맞춰주세요.'); return; }
    inFlight.current = true;
    setBusy(true);
    try {
      const project = await projectsApi.create({
        title: formData.projectName.trim(), className: formData.courseName.trim(),
        deadline: formData.deadline, checkinTime: `${formData.checkinTime}:00`,
        checkinFrequency: formData.checkinFrequency,
        checkinDays: (Object.keys(DAY_LABELS) as CheckinDay[]).filter(day => formData.checkinDays.includes(DAY_LABELS[day])),
      });
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { logout(); return; }
      setError(error instanceof Error ? error.message : '프로젝트를 만들지 못했습니다.');
      if (error instanceof ApiError) setFieldErrors(error.fieldErrors);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const toggleDay = (day: string) => {
    const prev = formData.checkinDays;
    if (prev.includes(day)) {
      setFormData({ ...formData, checkinDays: prev.filter(d => d !== day) });
    } else if (prev.length < formData.checkinFrequency) {
      setFormData({ ...formData, checkinDays: [...prev, day] });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack fallback="/projects" />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">새 프로젝트</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit}>
          <fieldset disabled={busy} className="space-y-4 min-w-0">
          {/* Basic info */}
          <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
            <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[12px] font-semibold text-[#374151]">기본 정보</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Input
                label="프로젝트명"
                maxLength={100}
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="예: HCI 기말 발표 과제"
                required
              />
              <Input
                label="수업명 (선택)"
                maxLength={100}
                value={formData.courseName}
                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="예: 인간컴퓨터상호작용"
              />
              <Input
                label="최종 마감일"
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </section>

          {/* Project type */}
          <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
            <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[12px] font-semibold text-[#374151]">프로젝트 유형</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[12px] text-muted-foreground mb-3">유형은 선택할 수 있지만 아직 서버에 저장되지 않습니다.</p>
              <div className="grid grid-cols-3 gap-2">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type.value}
                    aria-pressed={formData.projectType === type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: type.value })}
                    className={`h-9 rounded-md border text-[12px] font-medium transition-colors ${
                      formData.projectType === type.value
                        ? 'bg-primary text-white border-primary'
                        : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Check-in settings */}
          <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
            <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[12px] font-semibold text-[#374151]">체크인 설정</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">체크인 주기</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, checkinFrequency: n, checkinDays: [] })}
                      className={`w-9 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                        formData.checkinFrequency === n
                          ? 'bg-primary text-white border-primary'
                          : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-[12px] text-[#9CA3AF] ml-1">회/주</span>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                  체크인 요일{' '}
                  <span className="text-[11px] text-[#9CA3AF] font-normal">
                    ({formData.checkinDays.length}/{formData.checkinFrequency} 선택)
                  </span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`w-9 h-9 rounded-md border text-[12px] font-medium transition-colors ${
                        formData.checkinDays.includes(d)
                          ? 'bg-primary text-white border-primary'
                          : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="project-checkin-time" className="block text-[13px] font-medium text-[#374151] mb-1.5">체크인 마감 시간</label>
                <div className="flex items-center gap-3">
                  <input
                    id="project-checkin-time"
                    type="time"
                    required
                    value={formData.checkinTime}
                    onChange={e => setFormData({ ...formData, checkinTime: e.target.value })}
                    className="h-8 px-3 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-ring"
                  />
                  <p className="text-[11px] text-[#9CA3AF]">마감 이후 제출 시 지각 체크인으로 기록됩니다</p>
                </div>
              </div>
            </div>
          </section>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {Object.entries(fieldErrors).map(([field, message]) => <p key={field} role="alert" className="text-sm text-destructive">{message}</p>)}
          <Btn disabled={busy} type="submit" variant="primary" className="w-full h-11 text-[14px]">
            {busy ? '생성 중…' : '프로젝트 만들기'}
          </Btn>
          </fieldset>
        </form>
      </main>
    </div>
  );
}
