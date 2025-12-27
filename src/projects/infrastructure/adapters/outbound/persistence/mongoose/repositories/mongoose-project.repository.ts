import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectRepositoryPort } from '../../../../../../application/ports/outbound/project.repository.port';
import { Project } from '../../../../../../domain/entities/project.entity';
import { ProjectSchema, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class MongooseProjectRepository extends ProjectRepositoryPort {
  constructor(
    @InjectModel(ProjectSchema.name)
    private readonly model: Model<ProjectDocument>,
  ) {
    super();
  }

  async findAll(): Promise<Project[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByTechnology(technologySlug: string): Promise<Project[]> {
    const docs = await this.model
      .find({ technologies: technologySlug })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: ProjectDocument): Project {
    return new Project({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      startDate: doc.startDate,
      endDate: doc.endDate,
      technologies: doc.technologies,
      repositoryLink: doc.repositoryLink,
      demoLink: doc.demoLink,
      websiteLink: doc.websiteLink,
      achievements: doc.achievements,
      order: doc.order,
      isHighlighted: doc.isHighlighted,
    });
  }
}
