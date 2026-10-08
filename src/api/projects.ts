import { apiRequest, ApiError } from './client.ts';
export const DAY_LABELS = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' } as const;
export type CheckinDay = keyof typeof DAY_LABELS;
export const ROLE_LABELS = { LEADER: '팀장', CO_LEADER: '공동 팀장', MEMBER: '팀원' } as const;
export const STATUS_LABELS = { IN_PROGRESS: '진행 중', DONE: '완료', CLOSED: '종료' } as const;
export interface ProjectRequest {
  title: string;
  className?: string;
  deadline: string;
  checkinTime: string;
  checkinFrequency: number;
  checkinDays: CheckinDay[];
}
export interface ProjectResponse extends Omit<ProjectRequest, 'className'> {
  className: string | null;
  id: number;
  status: keyof typeof STATUS_LABELS;
  myRole: keyof typeof ROLE_LABELS;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
function isProject(value: unknown): value is ProjectResponse {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return Number.isSafeInteger(p.id) && Number(p.id) > 0 && typeof p.title === 'string' &&
    (p.className == null || typeof p.className === 'string') && typeof p.deadline === 'string' &&
    typeof p.checkinTime === 'string' && Number.isInteger(p.checkinFrequency) &&
    Array.isArray(p.checkinDays) && p.checkinDays.every(d => Object.hasOwn(DAY_LABELS, d)) &&
    typeof p.status === 'string' && Object.hasOwn(STATUS_LABELS, p.status) &&
    typeof p.myRole === 'string' && Object.hasOwn(ROLE_LABELS, p.myRole);
}
function parseProject(value: unknown): ProjectResponse {
  if (!isProject(value)) throw new ApiError(502, 'INVALID_RESPONSE', '프로젝트 응답 형식을 확인할 수 없습니다.');
  return value;
}
export function createProjectsApi(request: typeof apiRequest = apiRequest) {
  return {
    async list(signal?: AbortSignal) {
      const data = await request('/projects', { signal });
      if (!Array.isArray(data)) throw new ApiError(502, 'INVALID_RESPONSE', '프로젝트 목록 응답 형식을 확인할 수 없습니다.');
      return data.map(parseProject);
    },
    async detail(id: string, signal?: AbortSignal) {
      if (!/^[1-9]\d*$/.test(id)) throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      return parseProject(await request(`/projects/${id}`, { signal }));
    },
    async update(id: string, input: ProjectRequest) {
      if (!/^[1-9]\d*$/.test(id)) throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      await request(`/projects/${id}`, { method: 'PUT', body: input });
    },
    async close(id: string) {
      if (!/^[1-9]\d*$/.test(id)) throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      await request(`/projects/${id}/close`, { method: 'POST' });
    },
    async create(input: ProjectRequest) {
      return parseProject(await request('/projects', { method: 'POST', body: input }));
    },
  };
}
export const projectsApi = createProjectsApi();
