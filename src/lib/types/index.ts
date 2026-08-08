export interface NavigationItem {
  label: string;
  href: string;
}

export interface Testimonial {
  name: string;
  event: string;
  date: string;
  quote: string;
  clientPhoto: string;
  makeupPhoto: string;
}

export interface Photo {
  id: string;
  url: string;
  category: string;
  badge?: string;
  testimonial?: string;
  client?: string;
}
