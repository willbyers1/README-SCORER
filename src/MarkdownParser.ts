import { Section } from './types.js';

export class MarkdownParser {
  /**
   * Parses markdown content into a structured list of sections based on headers.
   */
  static parse(content: string): Section[] {
    const lines = content.split('\n');
    const sections: Section[] = [];
    let currentSection: Section | null = null;

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          level: headerMatch[1].length,
          title: headerMatch[2].trim(),
          content: ''
        };
      } else {
        if (currentSection) {
          currentSection.content += line + '\n';
        } else {
          // Content before any header
          currentSection = {
            level: 0,
            title: '__START__',
            content: line + '\n'
          };
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Finds a section by checking if its title contains any of the provided synonyms.
   */
  static findSection(sections: Section[], synonyms: string[]): Section | undefined {
    const lowerSynonyms = synonyms.map(s => s.toLowerCase());
    return sections.find(s => {
      const lowerTitle = s.title.toLowerCase();
      return lowerSynonyms.some(syn => lowerTitle.includes(syn));
    });
  }
}
