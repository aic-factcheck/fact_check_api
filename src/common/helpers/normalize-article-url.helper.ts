import { URL } from 'url';

export function normalizeArticleUrl(urlString: string): string {
  if (!/^http(s)?:\/\//i.test(urlString)) {
    urlString = 'http://' + urlString;
  }

  const url: URL = new URL(urlString);
  url.search = '';
  url.hash = '';

  return url.toString();
}
