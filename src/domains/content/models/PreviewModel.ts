export interface PreviewModel {
  google: {
    title: string;
    url: string;
    description: string;
  };
  social: {
    platform: 'whatsapp' | 'facebook' | 'linkedin' | 'x';
    title: string;
    description: string;
    domain: string;
    imageUrl: string;
  }[];
}
