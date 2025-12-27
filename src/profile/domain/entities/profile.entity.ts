import { AvailabilityStatus } from '../value-objects/availability-status.vo';
import { SocialLink } from './social-link.entity';

export interface ProfileProps {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone: string | null;
  location: string;
  timezone: string;
  availability: AvailabilityStatus;
  yearsOfExperience: number;
  profilePictureUrl: string | null;
  resumeUrl: string | null;
  socialLinks: SocialLink[];
}

export class Profile {
  public readonly id: string;
  public readonly fullName: string;
  public readonly title: string;
  public readonly bio: string;
  public readonly email: string;
  public readonly phone: string | null;
  public readonly location: string;
  public readonly timezone: string;
  public readonly availability: AvailabilityStatus;
  public readonly yearsOfExperience: number;
  public readonly profilePictureUrl: string | null;
  public readonly resumeUrl: string | null;
  public readonly socialLinks: SocialLink[];

  constructor(props: ProfileProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.title = props.title;
    this.bio = props.bio;
    this.email = props.email;
    this.phone = props.phone;
    this.location = props.location;
    this.timezone = props.timezone;
    this.availability = props.availability;
    this.yearsOfExperience = props.yearsOfExperience;
    this.profilePictureUrl = props.profilePictureUrl;
    this.resumeUrl = props.resumeUrl;
    this.socialLinks = props.socialLinks;
  }
}
