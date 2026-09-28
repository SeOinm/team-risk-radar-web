import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, Link, X, CheckSquare, Square } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { SizeBadgeDs, StatusChip, Btn, NavBack, Divider } from '@/components/ds';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));
const myMemberId = 'm4'; // 최유진

export function MemberTaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const task = sampleTasks.find(t => t.id === id) || sampleTasks[4];

  const [subTasks, setSubTasks] = useState(task.subTasks);
  const [newSubTask, setNewSubTask] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [artifactUrl, setArtifactUrl] = useState('');
  const [artifactLinks, setArtifactLinks] = useState<string[]>([]);
  const [showArtifactInput, setShowArtifactInput] = useState(false);

  const addSubTask = () => {
    if (!newSubTask.trim()) return;
    setSubTasks(prev => [...prev, { id: `new-${Date.now()}`, title: newSubTask, completed: false, assigneeId: myMemberId }]);
    setNewSubTask('');
    setShowAddInput(false);
  };

  const toggleSubTask = (stId: string) => {
    setSubTasks(prev => prev.map(st => st.id === stId && st.assigneeId === myMemberId ? { ...st, completed: !st.completed } : st));
  };

  const deleteSubTask = (stId: string) => {
    setSubTasks(prev => prev.filter(st => !(st.id === stId && st.assigneeId === myMemberId)));
  };

  const addArtifact = () => {
    if (!artifactUrl.trim()) return;
    setArtifactLinks(prev => [...prev, artifactUrl]);
    setArtifactUrl('');
    setShowArtifactInput(false);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex items-center px-4 gap-2">
          <NavBack label="홈" onClick={() => navigate('/member-home')} />
          <span className="text-[13px] font-semibold text-[#111827] truncate">{task.title}</span>
        </header>

        <div className="px-4 py-4 space-y-4">
          {/* Task info (read-only) */}
          <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
            <InfoRow label="크기"><SizeBadgeDs size={task.size} /></InfoRow>
            <InfoRow label="마감일"><span className="text-[12px] text-[#374151]">{task.dueDate}</span></InfoRow>
            <InfoRow label="상태"><StatusChip status={task.status} /></InfoRow>
            <InfoRow label="담당자">
              <div className="flex gap-1 flex-wrap justify-end">
                {task.assignees.map(aid => (
                  <span key={aid} className="text-[11px] px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[#374151]">
                    {memberMap[aid]?.name}
                  </span>
                ))}
              </div>
            </InfoRow>
            {task.prerequisiteIds.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-[11px] text-[#9CA3AF] mb-0.5">선행 작업</p>
                <p className="text-[11px] text-[#374151]">
                  {task.prerequisiteIds.map(pid => sampleTasks.find(t => t.id === pid)?.title).join(', ')}
                </p>
              </div>
            )}
            <div className="px-4 py-2">
              <p className="text-[11px] text-[#9CA3AF]">담당자·크기·마감일·선후행 관계는 팀장만 수정할 수 있습니다.</p>
            </div>
          </div>

          {/* Sub-tasks */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">하위 작업</p>
              <button
                onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1 text-[12px] text-[#6B7280] hover:text-[#111827]"
              >
                <Plus className="w-3.5 h-3.5" /> 추가
              </button>
            </div>

            {showAddInput && (
              <div className="flex gap-1.5 mb-3">
                <input
                  value={newSubTask}
                  onChange={e => setNewSubTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubTask()}
                  placeholder="하위 작업 이름"
                  className="flex-1 h-8 px-3 text-[12px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                  autoFocus
                />
                <Btn variant="primary" size="sm" onClick={addSubTask}>추가</Btn>
                <Btn variant="ghost" size="sm" onClick={() => setShowAddInput(false)}>
                  <X className="w-3.5 h-3.5" />
                </Btn>
              </div>
            )}

            <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
              {subTasks.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-[#9CA3AF]">하위 작업이 없습니다</div>
              ) : subTasks.map(st => {
                const isMine = st.assigneeId === myMemberId;
                return (
                  <div key={st.id} className="flex items-center gap-2 px-3 py-2.5">
                    <button
                      onClick={() => isMine && toggleSubTask(st.id)}
                      disabled={!isMine}
                      className={!isMine ? 'opacity-40 cursor-default' : ''}
                    >
                      {st.completed
                        ? <CheckSquare className="w-4 h-4 text-[#111827]" />
                        : <Square className="w-4 h-4 text-[#D1D5DB]" />
                      }
                    </button>
                    <span className={`flex-1 text-[12px] ${st.completed ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                      {st.title}
                    </span>
                    {!isMine && <span className="text-[11px] text-[#9CA3AF]">{memberMap[st.assigneeId]?.name}</span>}
                    {isMine && (
                      <button onClick={() => deleteSubTask(st.id)} className="text-[#D1D5DB] hover:text-[#DC2626] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Artifact links */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">산출물 링크</p>
              <button
                onClick={() => setShowArtifactInput(true)}
                className="flex items-center gap-1 text-[12px] text-[#6B7280] hover:text-[#111827]"
              >
                <Plus className="w-3.5 h-3.5" /> 등록
              </button>
            </div>

            {showArtifactInput && (
              <div className="flex gap-1.5 mb-3">
                <input
                  value={artifactUrl}
                  onChange={e => setArtifactUrl(e.target.value)}
                  placeholder="링크 URL"
                  className="flex-1 h-8 px-3 text-[12px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                  autoFocus
                />
                <Btn variant="primary" size="sm" onClick={addArtifact}>등록</Btn>
              </div>
            )}

            {artifactLinks.length === 0 ? (
              <div className="border border-dashed border-[#E5E7EB] rounded-md py-6 text-center text-[12px] text-[#9CA3AF]">
                등록된 산출물 링크가 없습니다
              </div>
            ) : (
              <div className="border border-[#E5E7EB] rounded-md overflow-hidden divide-y divide-[#E5E7EB]">
                {artifactLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5">
                    <Link className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-[12px] text-[#2563EB] hover:underline truncate">{link}</a>
                    <button onClick={() => setArtifactLinks(prev => prev.filter((_, j) => j !== i))}
                      className="text-[#D1D5DB] hover:text-[#DC2626] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Divider />

          <Btn variant="primary" className="w-full h-11 text-[14px]" onClick={() => navigate('/checkin')}>
            이 작업 체크인 하기
          </Btn>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[11px] text-[#9CA3AF]">{label}</span>
      {children}
    </div>
  );
}
