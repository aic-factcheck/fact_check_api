export interface ExtractResponseType {
  title: string;
  author: string;
  hostname: string;
  date: Date;
  categories: string[];
  fingerprint: string;
  id: string | null;
  license: string | null;
  comments: string | null;
  raw_text: string;
  text: string;
  language: string | null;
  excerpt: string;
}
