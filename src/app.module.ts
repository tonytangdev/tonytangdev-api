import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SkillsModule } from './skills/skills.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationModule } from './education/education.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const skillsEnabled =
      configService.get('SKILLS_MODULE_ENABLED', 'false') === 'true';
    const experiencesEnabled =
      configService.get('EXPERIENCES_MODULE_ENABLED', 'false') === 'true';
    const educationEnabled =
      configService.get('EDUCATION_MODULE_ENABLED', 'false') === 'true';

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ...(skillsEnabled ? [SkillsModule.forRoot()] : []),
        ...(experiencesEnabled ? [ExperiencesModule.forRoot()] : []),
        ...(educationEnabled ? [EducationModule.forRoot()] : []),
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
