export interface BusinessLine {
  name: string;
  description: string;
  url: string;
  logo: string;
  shortDescription: string;
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