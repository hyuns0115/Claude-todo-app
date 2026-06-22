import { db } from './index';
import { tickets } from './schema';

async function seed() {
  await db.delete(tickets);

  await db.insert(tickets).values([
    {
      title: '프로젝트 초기 설정',
      description: 'Next.js, TypeScript, Tailwind CSS 설정',
      status: 'DONE',
      priority: 'HIGH',
      position: 0,
      completedAt: new Date(),
    },
    {
      title: 'DB 스키마 설계',
      description: 'Drizzle ORM 스키마 정의 및 마이그레이션',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      position: 1024,
    },
    {
      title: 'API 엔드포인트 구현',
      description: 'REST API Route Handler 작성',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 1024,
    },
    {
      title: '칸반 보드 UI',
      description: '드래그앤드롭 칸반 보드 컴포넌트',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      position: 1024,
    },
  ]);

  console.log('Seed data inserted.');
}

seed().catch(console.error);
