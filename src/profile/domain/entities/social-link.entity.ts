import { SocialPlatform } from '../value-objects/social-platform.vo';

export interface SocialLinkProps {
  platform: SocialPlatform;
  url: string;
  username: string;
}

export class SocialLink {
  public readonly platform: SocialPlatform;
  public readonly url: string;
  public readonly username: string;

  constructor(props: SocialLinkProps) {
    this.platform = props.platform;
    this.url = props.url;
    this.username = props.username;
  }
}
