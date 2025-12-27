import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SkillsModule } from './skills/skills.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationModule } from './education/education.module';
import { ProjectsModule } from './projects/projects.module';
import { ProfileModule } from './profile/profile.module';
import { LanguagesModule } from './languages/languages.module';
import { RefactoringsModule } from './refactorings/refactorings.module';

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
    const projectsEnabled =
      configService.get('PROJECTS_MODULE_ENABLED', 'false') === 'true';
    const profileEnabled =
      configService.get('PROFILE_MODULE_ENABLED', 'false') === 'true';
    const languagesEnabled =
      configService.get('LANGUAGES_MODULE_ENABLED', 'false') === 'true';
    const refactoringsEnabled =
      configService.get('REFACTORINGS_MODULE_ENABLED', 'false') === 'true';

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ...(skillsEnabled ? [SkillsModule.forRoot()] : []),
        ...(experiencesEnabled ? [ExperiencesModule.forRoot()] : []),
        ...(educationEnabled ? [EducationModule.forRoot()] : []),
        ...(projectsEnabled ? [ProjectsModule.forRoot()] : []),
        ...(profileEnabled ? [ProfileModule.forRoot()] : []),
        ...(languagesEnabled ? [LanguagesModule.forRoot()] : []),
        ...(refactoringsEnabled ? [RefactoringsModule.forRoot()] : []),
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
