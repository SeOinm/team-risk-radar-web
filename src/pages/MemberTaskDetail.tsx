import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, CheckCircle2, Trash2, Link, X } from 'lucide-react';
import { SizeBadge } from '@/components/SizeBadge';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

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
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen">
        {/* 헤더 */}
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/member-home')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="flex-1 truncate">{task.title}</h2>
          </div>
        </header>

        <div className="px-4 py-5 space-y-5">
          {/* 기본 정보 (읽기 전용) */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">크기</span>
              <SizeBadge size={task.size} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">마감일</span>
              <span className="text-sm">{task.dueDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">상태</span>
              <span className="text-sm">{task.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">담당자</span>
              <div className="flex gap-1">
                {task.assignees.map(aid => (
                  <span key={aid} className="text-xs bg-muted px-2 py-0.5 rounded-full">{memberMap[aid]?.name}</span>
                ))}
              </div>
            </div>
            {task.prerequisiteIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">선행 작업</span>
                <span className="text-xs text-muted-foreground">
                  {task.prerequisiteIds.map(pid => sampleTasks.find(t => t.id === pid)?.title).join(', ')}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground italic">담당자·크기·마감일·선후행 관계는 팀장만 수정할 수 있습니다.</p>
          </div>

          {/* 하위 작업 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">하위 작업</h3>
              <button
                onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1 text-xs text-primary"
              >
                <Plus className="w-3.5 h-3.5" /> 추가
              </button>
            </div>

            {showAddInput && (
              <div className="flex gap-2 mb-2">
                <input
                  value={newSubTask}
                  onChange={e => setNewSubTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubTask()}
                  placeholder="하위 작업 이름"
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-card"
                  autoFocus
                />
                <button onClick={addSubTask} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs">추가</button>
                <button onClick={() => setShowAddInput(false)} className="px-2 py-2 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {subTasks.map(st => {
                const isMine = st.assigneeId === myMemberId;
                return (
                  <div key={st.id} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5">
                    <button
                      onClick={() => isMine && toggleSubTask(st.id)}
                      disabled={!isMine}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        st.completed ? 'bg-primary border-primary' : 'border-border'
                      } ${!isMine ? 'opacity-50 cursor-default' : ''}`}
                    >
                      {st.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${st.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {st.title}
                    </span>
                    {!isMine && <span className="text-xs text-muted-foreground">{memberMap[st.assigneeId]?.name}</span>}
                    {isMine && (
                      <button onClick={() => deleteSubTask(st.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {subTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">하위 작업이 없습니다</p>
              )}
            </div>
          </section>

          {/* 산출물 링크 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">산출물 링크</h3>
              <button onClick={() => setShowArtifactInput(true)} className="flex items-center gap-1 text-xs text-primary">
                <Plus className="w-3.5 h-3.5" /> 등록
              </button>
            </div>

            {showArtifactInput && (
              <div className="flex gap-2 mb-2">
                <input
                  value={artifactUrl}
                  onChange={e => setArtifactUrl(e.target.value)}
                  placeholder="링크 URL"
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-card"
                  autoFocus
                />
                <button onClick={addArtifact} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs">등록</button>
              </div>
            )}

            {artifactLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 mb-2">
                <Link className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-1 truncate">{link}</a>
                <button onClick={() => setArtifactLinks(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {artifactLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-3 bg-card border border-dashed border-border rounded-lg">등록된 산출물 링크가 없습니다</p>
            )}
          </section>

          <button
            onClick={() => navigate('/checkin')}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
          >
            이 작업 체크인 하기
          </button>
        </div>
      </div>
    </div>
  );
}
