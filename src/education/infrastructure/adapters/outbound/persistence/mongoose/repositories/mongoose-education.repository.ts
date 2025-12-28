import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EducationRepositoryPort } from '../../../../../../application/ports/outbound/education.repository.port';
import { Education } from '../../../../../../domain/entities/education.entity';
import {
  EducationSchema,
  EducationDocument,
} from '../schemas/education.schema';
import { DegreeType } from '../../../../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../../../../domain/value-objects/education-status.vo';

@Injectable()
export class MongooseEducationRepository extends EducationRepositoryPort {
  constructor(
    @InjectModel(EducationSchema.name)
    private readonly model: Model<EducationDocument>,
  ) {
    super();
  }

  async findAll(): Promise<Education[]> {
    const docs = await this.model.find().sort({ order: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findHighlighted(): Promise<Education[]> {
    const docs = await this.model
      .find({ isHighlighted: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findInProgress(): Promise<Education[]> {
    const docs = await this.model
      .find({ status: EducationStatus.IN_PROGRESS })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(education: Education): Promise<Education> {
    const doc = await this.model.create({
      _id: education.id,
      institution: education.institution,
      degreeType: education.degreeType,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate,
      description: education.description,
      achievements: education.achievements,
      location: education.location,
      status: education.status,
      isHighlighted: education.isHighlighted,
      order: education.order,
    });
    return this.toDomain(doc);
  }

  async findByCompositeKey(
    institution: string,
    degreeType: DegreeType,
    fieldOfStudy: string,
  ): Promise<Education | null> {
    const doc = await this.model
      .findOne({
        institution,
        degreeType,
        fieldOfStudy,
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async getMaxOrder(): Promise<number> {
    const doc = await this.model
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .exec();
    return doc?.order ?? 0;
  }

  async findById(id: string): Promise<Education | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCompositeKeyExcludingId(params: {
    institution: string;
    degreeType: DegreeType;
    fieldOfStudy: string;
    excludeId: string;
  }): Promise<Education | null> {
    const doc = await this.model
      .findOne({
        institution: params.institution,
        degreeType: params.degreeType,
        fieldOfStudy: params.fieldOfStudy,
        _id: { $ne: params.excludeId },
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(education: Education): Promise<Education> {
    const doc = await this.model
      .findByIdAndUpdate(
        education.id,
        {
          institution: education.institution,
          degreeType: education.degreeType,
          fieldOfStudy: education.fieldOfStudy,
          startDate: education.startDate,
          endDate: education.endDate,
          description: education.description,
          achievements: education.achievements,
          location: education.location,
          status: education.status,
          isHighlighted: education.isHighlighted,
          order: education.order,
        },
        { new: true },
      )
      .exec();
    return this.toDomain(doc!);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: EducationDocument): Education {
    return new Education({
      id: doc._id,
      institution: doc.institution,
      degreeType: doc.degreeType as DegreeType,
      fieldOfStudy: doc.fieldOfStudy,
      startDate: doc.startDate,
      endDate: doc.endDate,
      description: doc.description,
      achievements: doc.achievements,
      location: doc.location,
      status: doc.status as EducationStatus,
      isHighlighted: doc.isHighlighted,
      order: doc.order,
    });
  }
}
