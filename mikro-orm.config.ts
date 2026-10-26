// 在 MikroORM 配置加载时读取 .env，避免在每个 npm script 中重复配置环境预加载参数。
import 'dotenv/config';

import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';

// 将 .env 中的字符串端口转换成 MikroORM 需要的数字端口。
const databasePort = process.env.MIKRO_ORM_PORT
  ? Number(process.env.MIKRO_ORM_PORT)
  : undefined;

export default defineConfig({
  // 使用 PostgreSQL 驱动，保持 CLI 与 Nest 应用共用同一份数据库配置。
  driver: PostgreSqlDriver,
  // 显式读取数据库连接配置，避免依赖 CLI 在导入配置前扫描环境变量。
  host: process.env.MIKRO_ORM_HOST,
  port: databasePort,
  user: process.env.MIKRO_ORM_USER,
  password: process.env.MIKRO_ORM_PASSWORD,
  dbName: process.env.MIKRO_ORM_DB_NAME,
  metadataProvider: TsMorphMetadataProvider,
  // 实体发现阶段不因为某些命令未加载实体而额外告警。
  discovery: { warnWhenNoEntities: false },
  // 编译后使用 JS 实体；开发/CLI 的 TS 模式使用源码实体。
  entitiesTs: ['./src/**/*.entity.ts'],
  entities: ['./dist/**/*.entity.js'],
  extensions: [Migrator, SeedManager],
  // 开启调试日志，便于查看 SQL 和实体发现信息。
  debug: true,
  seeder: {
    // path 指向编译后的 JS seeders，供 seeder:run 在 dist 模式下执行。
    path: './dist/src/seeders',
    // pathTs 指向源码 seeders，供 seeder:create 等 TS 开发模式使用。
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder', // 默认执行的 seeder 类名。
    glob: '!(*.d).{js,ts}', // 匹配 JS/TS seeder 文件，排除声明文件。
    emit: 'ts', // 新建 seeder 时生成 TypeScript 文件。
    fileName: (className: string) => className, // seeder 文件名与类名保持一致。
  },
});
