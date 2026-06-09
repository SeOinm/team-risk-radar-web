// Shared sample data for 팀플 리스크 레이더

import type { Role, RiskLevel, TeamMember, Task, Project } from '@/types';

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 24) return '안정';
  if (score <= 49) return '관찰';
  if (score <= 69) return '주의';
  if (score <= 84) return '위험';
  return '심각';
}

export function getRiskColor(score: number) {
  if (score <= 24) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (score <= 49) return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' };
  if (score <= 69) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' };
  if (score <= 84) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' };
  return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
}

export const sampleMembers: TeamMember[] = [
  {
    id: 'm1',
    name: '김지훈',
    role: '팀장',
    joinDate: '2024-04-01',
    workload: 14,
    checkinRate: 100,
    lateCheckins: 0,
    missedCheckins: 0,
    taskCount: 1,
    statusLabel: '안정적으로 참여 중',
    riskScore: 12,
  },
  {
    id: 'm2',
    name: '박서연',
    role: '팀원',
    joinDate: '2024-04-01',
    workload: 47,
    checkinRate: 40,
    lateCheckins: 0,
    missedCheckins: 2,
    taskCount: 3,
    statusLabel: '작업량 과다',
    riskScore: 78,
  },
  {
    id: 'm3',
    name: '이도현',
    role: '공동 팀장',
    joinDate: '2024-04-01',
    workload: 14,
    checkinRate: 100,
    lateCheckins: 0,
    missedCheckins: 0,
    taskCount: 1,
    statusLabel: '안정적으로 참여 중',
    riskScore: 15,
  },
  {
    id: 'm4',
    name: '최유진',
    role: '팀원',
    joinDate: '2024-04-02',
    workload: 25,
    checkinRate: 100,
    lateCheckins: 1,
    missedCheckins: 0,
    taskCount: 2,
    statusLabel: '안정적으로 참여 중',
    riskScore: 22,
  },
];

export const pendingMembers = [
  { id: 'p1', name: '한지민', email: 'jimin@snu.ac.kr', requestedAt: '2024-06-05' },
];

export const sampleTasks: Task[] = [
  {
    id: 't1',
    title: '주제 확정',
    size: 'S',
    assignees: ['m1'],
    status: '완료',
    progress: 100,
    dueDate: '2024-05-15',
    delayed: false,
    riskScore: 5,
    prerequisiteIds: [],
    subTasks: [
      { id: 'st1', title: '후보 주제 목록 작성', completed: true, assigneeId: 'm1' },
      { id: 'st2', title: '팀원 투표', completed: true, assigneeId: 'm1' },
      { id: 'st3', title: '교수님 확인', completed: true, assigneeId: 'm1' },
    ],
    artifactLinks: 2,
  },
  {
    id: 't2',
    title: '자료 조사',
    size: 'L',
    assignees: ['m2'],
    status: '진행 중',
    progress: 25,
    dueDate: '2024-05-28',
    delayed: true,
    delayDays: 3,
    riskScore: 82,
    prerequisiteIds: ['t1'],
    subTasks: [
      { id: 'st4', title: '관련 논문 탐색', completed: true, assigneeId: 'm2' },
      { id: 'st5', title: '국내 사례 조사', completed: false, assigneeId: 'm2' },
      { id: 'st6', title: '해외 사례 정리', completed: false, assigneeId: 'm2' },
      { id: 'st7', title: '자료 정리 및 공유', completed: false, assigneeId: 'm2' },
    ],
    blockedReason: undefined,
    artifactLinks: 0,
  },
  {
    id: 't3',
    title: '보고서 초안',
    size: 'M',
    assignees: ['m3'],
    status: '진행 전',
    progress: 0,
    dueDate: '2024-06-05',
    delayed: false,
    riskScore: 55,
    prerequisiteIds: ['t2'],
    subTasks: [
      { id: 'st8', title: '서론 작성', completed: false, assigneeId: 'm3' },
      { id: 'st9', title: '본론 작성', completed: false, assigneeId: 'm3' },
      { id: 'st10', title: '결론 작성', completed: false, assigneeId: 'm3' },
    ],
    artifactLinks: 0,
  },
  {
    id: 't4',
    title: '발표자료 제작',
    size: 'L',
    assignees: ['m2'],
    status: '진행 전',
    progress: 0,
    dueDate: '2024-06-09',
    delayed: false,
    riskScore: 71,
    prerequisiteIds: ['t2', 't3'],
    subTasks: [
      { id: 'st11', title: '슬라이드 구조 설계', completed: false, assigneeId: 'm2' },
      { id: 'st12', title: '디자인 템플릿 적용', completed: false, assigneeId: 'm2' },
      { id: 'st13', title: '콘텐츠 작성', completed: false, assigneeId: 'm2' },
    ],
    artifactLinks: 0,
  },
  {
    id: 't5',
    title: '발표 대본 작성',
    size: 'M',
    assignees: ['m4'],
    status: '진행 전',
    progress: 0,
    dueDate: '2024-06-10',
    delayed: false,
    riskScore: 30,
    prerequisiteIds: ['t4'],
    subTasks: [
      { id: 'st14', title: '파트 분배', completed: false, assigneeId: 'm4' },
      { id: 'st15', title: '각자 대본 작성', completed: false, assigneeId: 'm4' },
    ],
    artifactLinks: 0,
  },
  {
    id: 't6',
    title: '발표 연습',
    size: 'S',
    assignees: [],
    status: '진행 전',
    progress: 0,
    dueDate: '2024-06-12',
    delayed: false,
    riskScore: 20,
    prerequisiteIds: ['t5'],
    subTasks: [],
    artifactLinks: 0,
  },
  {
    id: 't7',
    title: '제출 및 마감',
    size: 'S',
    assignees: ['m1'],
    status: '진행 전',
    progress: 0,
    dueDate: '2024-06-13',
    delayed: false,
    riskScore: 15,
    prerequisiteIds: ['t4'],
    subTasks: [],
    artifactLinks: 0,
  },
];

export const sampleProject: Project = {
  id: 'p1',
  title: 'HCI 기말 발표 과제',
  className: '인간컴퓨터상호작용',
  deadline: '2024-06-13',
  checkinDays: ['월', '수', '금'],
  checkinTime: '23:59',
  checkinFrequency: 3,
  riskScore: 71,
  riskDelta: 9,
  diagnosticConfidence: 'medium',
  members: sampleMembers,
  tasks: sampleTasks,
  checkinHistory: [],
  status: '진행 중',
};

export const projectList = [
  {
    id: 'p1',
    title: 'HCI 기말 발표 과제',
    className: '인간컴퓨터상호작용',
    deadline: '2024-06-13',
    myRole: '팀장' as Role,
    riskScore: 71,
    status: '진행 중' as const,
  },
  {
    id: 'p2',
    title: '캡스톤 디자인',
    className: '졸업작품 세미나',
    deadline: '2024-06-20',
    myRole: '팀원' as Role,
    riskScore: 38,
    status: '진행 중' as const,
  },
  {
    id: 'p3',
    title: '마케팅 사례분석',
    className: '마케팅원론',
    deadline: '2024-05-31',
    myRole: '공동 팀장' as Role,
    riskScore: 10,
    status: '완료' as const,
  },
];
