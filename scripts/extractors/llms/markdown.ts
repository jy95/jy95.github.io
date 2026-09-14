export const renderSection = (title: string, body: string): string => `## ${title}\n\n${body}`;

export const renderBulletList = (lines: readonly string[]): string =>
    lines.map((line) => `- ${line}`).join("\n");