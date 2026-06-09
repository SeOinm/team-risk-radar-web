import { Routes, Route } from 'react-router';
import { ProjectList } from '@/pages/ProjectList';
import { Home } from '@/pages/Home';
import { AuthScreens } from '@/pages/AuthScreens';
import { CreateProject } from '@/pages/CreateProject';
import { TaskOnboarding } from '@/pages/TaskOnboarding';
import { InviteTeam } from '@/pages/InviteTeam';
import { JoinTeam } from '@/pages/JoinTeam';
import { MemberHome } from '@/pages/MemberHome';
import { MemberCheckin } from '@/pages/MemberCheckin';
import { CheckinComplete } from '@/pages/CheckinComplete';
import { MemberTaskDetail } from '@/pages/MemberTaskDetail';
import { MemberRecord } from '@/pages/MemberRecord';
import { Dashboard } from '@/pages/Dashboard';
import { TaskBoard } from '@/pages/TaskBoard';
import { TaskDetail } from '@/pages/TaskDetail';
import { CheckinStatus } from '@/pages/CheckinStatus';
import { MemberManage } from '@/pages/MemberManage';
import { MemberParticipation } from '@/pages/MemberParticipation';
import { Timeline } from '@/pages/Timeline';
import { FinalReport } from '@/pages/FinalReport';
import { ProjectSettings } from '@/pages/ProjectSettings';
import { ProjectClose } from '@/pages/ProjectClose';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm">페이지를 찾을 수 없습니다</p>
      <h1 className="text-2xl font-semibold text-foreground">404 — Not Found</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* 랜딩/목록 */}
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/auth" element={<AuthScreens />} />

      {/* 팀장 흐름 */}
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/task-onboarding" element={<TaskOnboarding />} />
      <Route path="/invite-team" element={<InviteTeam />} />

      {/* 팀원 흐름 */}
      <Route path="/join" element={<JoinTeam />} />
      <Route path="/member-home" element={<MemberHome />} />
      <Route path="/checkin" element={<MemberCheckin />} />
      <Route path="/checkin-complete" element={<CheckinComplete />} />
      <Route path="/my-task/:id" element={<MemberTaskDetail />} />
      <Route path="/my-record" element={<MemberRecord />} />

      {/* 팀장 대시보드 */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/task-board" element={<TaskBoard />} />
      <Route path="/task/:id" element={<TaskDetail />} />
      <Route path="/checkin-status" element={<CheckinStatus />} />
      <Route path="/members" element={<MemberManage />} />
      <Route path="/member/:id" element={<MemberParticipation />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/report" element={<FinalReport />} />
      <Route path="/settings" element={<ProjectSettings />} />
      <Route path="/close-project" element={<ProjectClose />} />

      {/* 미정의 경로 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
