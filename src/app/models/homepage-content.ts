import { IHomepageContent } from '../interfaces/homepage-content.interface';

export class HomepageContent implements IHomepageContent {
  constructor(private homepageContentData: IHomepageContent) { }

  public get title(): string {
    return this.homepageContentData.title;
  }

  public get text(): string {
    return this.homepageContentData.text;
  }

  public get time(): number {
    return this.homepageContentData.time;
  }
}
