import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="목록" onClick={() => navigate('/projects')} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">새 프로젝트</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={e => { e.preventDefault(); navigate('/task-onboarding'); }} className="space-y-4">
          {/* Basic info */}
          <section className="border border-[#E5E7EB] rounded-md overflow-hidden">
            <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <span className="text-[12px] font-semibold text-[#374151]">기본 정보</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Input
                label="프로젝트명"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="예: HCI 기말 발표 과제"
                required
              />
              <Input
                label="수업명 (선택)"
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
              <div className="grid grid-cols-3 gap-2">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: type.value })}
                    className={`h-9 rounded-md border text-[12px] font-medium transition-colors ${
                      formData.projectType === type.value
                        ? 'bg-[#111827] text-white border-[#111827]'
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
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, checkinFrequency: n, checkinDays: [] })}
                      className={`w-9 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                        formData.checkinFrequency === n
                          ? 'bg-[#111827] text-white border-[#111827]'
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
                          ? 'bg-[#111827] text-white border-[#111827]'
                          : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">체크인 마감 시간</label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={formData.checkinTime}
                    onChange={e => setFormData({ ...formData, checkinTime: e.target.value })}
                    className="h-8 px-3 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <p className="text-[11px] text-[#9CA3AF]">마감 이후 제출 시 지각 체크인으로 기록됩니다</p>
                </div>
              </div>
            </div>
          </section>

          <Btn type="submit" variant="primary" className="w-full h-11 text-[14px]">
            다음 단계로 →
          </Btn>
        </form>
      </main>
    </div>
  );
}
