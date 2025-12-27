import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const mongodbEnabled =
      configService.get('MONGODB_ENABLED', 'true') === 'true';
    const postgresqlEnabled =
      configService.get('POSTGRESQL_ENABLED', 'true') === 'true';

    const imports: any[] = [];

    if (postgresqlEnabled) {
      imports.push(
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE_NAME'),
            entities: [__dirname + '/../**/*.entity.orm{.ts,.js}'],
            synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
            logging: configService.get<boolean>('DATABASE_LOGGING'),
          }),
          inject: [ConfigService],
        }),
      );
    }

    if (mongodbEnabled) {
      imports.push(
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('MONGODB_URI'),
            dbName: configService.get('MONGODB_DATABASE'),
          }),
          inject: [ConfigService],
        }),
      );
    }

    return {
      module: DatabaseModule,
      imports,
    };
  }
}
