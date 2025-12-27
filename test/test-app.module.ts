import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { SkillsModule } from '../src/skills/skills.module';
import { ExperiencesModule } from '../src/experiences/experiences.module';
import { EducationModule } from '../src/education/education.module';
import { ProjectsModule } from '../src/projects/projects.module';
import { ProfileModule } from '../src/profile/profile.module';
import { LanguagesModule } from '../src/languages/languages.module';
import { RefactoringsModule } from '../src/refactorings/refactorings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const skillsEnabled =
      configService.get('SKILLS_MODULE_ENABLED', 'false') === 'true';
    const experiencesEnabled =
      configService.get('EXPERIENCES_MODULE_ENABLED', 'false') === 'true';
    const educationEnabled =
      configService.get('EDUCATION_MODULE_ENABLED', 'false') === 'true';
    const projectsEnabled =
      configService.get('PROJECTS_MODULE_ENABLED', 'false') === 'true';
    const profileEnabled =
      configService.get('PROFILE_MODULE_ENABLED', 'false') === 'true';
    const languagesEnabled =
      configService.get('LANGUAGES_MODULE_ENABLED', 'false') === 'true';
    const refactoringsEnabled =
      configService.get('REFACTORINGS_MODULE_ENABLED', 'false') === 'true';

    return {
      module: TestAppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Note: No DatabaseModule for tests - using in-memory repos
        ...(skillsEnabled ? [SkillsModule.forTest()] : []),
        ...(experiencesEnabled ? [ExperiencesModule.forTest()] : []),
        ...(educationEnabled ? [EducationModule.forTest()] : []),
        ...(projectsEnabled ? [ProjectsModule.forTest()] : []),
        ...(profileEnabled ? [ProfileModule.forTest()] : []),
        ...(languagesEnabled ? [LanguagesModule.forTest()] : []),
        ...(refactoringsEnabled ? [RefactoringsModule.forTest()] : []),
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
