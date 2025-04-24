export interface BusinessLine {
  name: string;
  description: string;
  url: string;
  logo: string;
  shortDescription: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterLink {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  businessLine: string;
}