import { URL } from 'url';

export function normalizeArticleUrl(urlString: string): string {
  const url: URL = new URL(urlString);
  url.search = '';
  url.hash = '';

  return url.toString();
}
