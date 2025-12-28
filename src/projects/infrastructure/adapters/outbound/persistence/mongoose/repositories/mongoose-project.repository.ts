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

  async create(project: Project): Promise<Project> {
    const doc = new this.model(this.toDocument(project));
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(project: Project): Promise<Project> {
    await this.model
      .updateOne({ _id: project.id }, this.toDocument(project))
      .exec();
    return project;
  }

  async findByName(name: string): Promise<Project | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<Project | null> {
    const doc = await this.model
      .findOne({ name, _id: { $ne: excludeId } })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.model
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .exec();
    return result?.order ?? 0;
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

  private toDocument(project: Project): Partial<ProjectDocument> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      _id: project.id as any,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      technologies: project.technologies,
      repositoryLink: project.repositoryLink,
      demoLink: project.demoLink,
      websiteLink: project.websiteLink,
      achievements: project.achievements,
      order: project.order,
      isHighlighted: project.isHighlighted,
    };
  }
}
