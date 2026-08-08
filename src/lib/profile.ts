export type LinkId = 'whatsapp' | 'cal' | 'arm' | 'email' | 'github' | 'x';

export type IconName = LinkId;

export interface ProfileLink {
  id: LinkId;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  section: 'contact' | 'solutions' | 'presence';
  external: boolean;
  primary?: boolean;
  interaction?: 'cal-dialog';
}

const allowedSchemes = new Set(['https:', 'mailto:']);

export function validateProfileLinks(links: readonly ProfileLink[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const link of links) {
    if (ids.has(link.id)) issues.push(`duplicate id: ${link.id}`);
    ids.add(link.id);

    if (!link.title.trim()) issues.push(`${link.id} is missing a title`);
    if (!link.description.trim()) issues.push(`${link.id} is missing a description`);

    try {
      const url = new URL(link.href);
      if (!allowedSchemes.has(url.protocol)) {
        issues.push(`${link.id} has an unsupported URL scheme`);
      }
    } catch {
      issues.push(`${link.id} has an invalid URL`);
    }
  }

  return issues;
}

export function assertProfileLinks(links: readonly ProfileLink[]): void {
  const issues = validateProfileLinks(links);
  if (issues.length > 0) throw new Error(issues.join('; '));
}
