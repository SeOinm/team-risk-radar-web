// Shared domain types for 팀플 리스크 레이더

export type Role = '팀장' | '공동 팀장' | '팀원';
export type RiskLevel = '안정' | '관찰' | '주의' | '위험' | '심각';
export type TaskStatus = '진행 전' | '진행 중' | '막힘' | '완료' | '취소';
export type TaskSize = 'S' | 'M' | 'L' | 'XL';
export type CheckinStatus = '완료' | '지각' | '누락' | '대상 제외' | '일부 미업데이트';
export type MemberStatusLabel =
  | '안정적으로 참여 중'
  | '확인 필요'
  | '작업량 과다'
  | '배정된 작업 없음'
  | '산출물 근거 부족'
  | '지연 영향 큼';

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  joinDate: string;
  workload: number; // percentage
  checkinRate: number; // percentage
  lateCheckins: number;
  missedCheckins: number;
  taskCount: number;
  statusLabel: MemberStatusLabel;
  riskScore?: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId: string;
}

export interface Task {
  id: string;
  title: string;
  size: TaskSize;
  assignees: string[]; // member ids
  status: TaskStatus;
  progress: number;
  dueDate: string;
  delayed: boolean;
  delayDays?: number;
  riskScore: number;
  prerequisiteIds: string[];
  subTasks: SubTask[];
  blockedReason?: string;
  artifactLinks: number;
  cancelled?: boolean;
  cancelledAt?: string;
}

export interface CheckinRecord {
  round: number;
  date: string;
  memberId: string;
  status: CheckinStatus;
  taskUpdates: { taskId: string; progress: number; taskStatus: TaskStatus; blockedReason?: string }[];
}

export interface Project {
  id: string;
  title: string;
  className: string;
  deadline: string;
  checkinDays: string[];
  checkinTime: string;
  checkinFrequency: number;
  riskScore: number;
  riskDelta: number;
  diagnosticConfidence: 'high' | 'medium' | 'low';
  members: TeamMember[];
  tasks: Task[];
  checkinHistory: CheckinRecord[];
  status: '진행 중' | '완료' | '종료';
}
