import type { TaskTemplate } from '@/api/tasks';

export const PROJECT_TYPES = [
  { value: 'presentation', label: '발표', tasks: ['발표 주제 확정', '자료 조사', '발표자료 제작', '발표 리허설', '최종 제출'] },
  { value: 'report', label: '보고서', tasks: ['보고서 주제 확정', '자료 조사', '보고서 초안 작성', '검토 및 수정', '최종 제출'] },
  { value: 'development', label: '개발', tasks: ['요구사항 정리', '기능 설계', '핵심 기능 구현', '테스트 및 수정', '최종 제출'] },
  { value: 'design', label: '디자인·기획', tasks: ['요구사항 조사', '콘셉트 기획', '시안 제작', '피드백 반영', '최종 제출'] },
  { value: 'research', label: '조사·실험', tasks: ['연구 질문 선정', '조사·실험 설계', '데이터 수집', '결과 분석', '최종 제출'] },
  { value: 'other', label: '기타', tasks: ['목표와 역할 정하기', '자료 준비', '결과물 제작', '최종 검토', '최종 제출'] },
] as const;

export function calendarTemplates(available: TaskTemplate[]) {
  return [
    ...available,
    ...PROJECT_TYPES.filter(type => !available.some(template =>
      template.template.toLowerCase() === type.value || template.name === type.label,
    )).map((type): TaskTemplate => ({
      template: `local:${type.value}`,
      name: type.label,
      tasks: type.tasks.map((title, index) => ({ title, size: index === 0 || index === type.tasks.length - 1 ? 'S' : 'M' })),
    })),
  ];
}
