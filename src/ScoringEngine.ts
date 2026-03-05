import { Section, ScoreReport, ScoreDetail } from './types.js';
import { MarkdownParser } from './MarkdownParser.js';

export class ScoringEngine {
  /**
   * Calculates the Quality Score based on the presence and quality of specific sections.
   */
  static score(content: string, fileSize: number): ScoreReport {
    const sections = MarkdownParser.parse(content);
    const details: ScoreDetail[] = [];
    const suggestions: string[] = [];
    let totalScore = 0;

    // 1. Project Description (25 pts)
    const descSynonyms = ['about', 'overview', 'description', 'introduction'];
    let descSection = MarkdownParser.findSection(sections, descSynonyms);
    
    // If not found by synonym, check if there's an H1 or __START__ with content
    if (!descSection) {
      descSection = sections.find(s => s.level === 1 || s.title === '__START__');
    }

    if (descSection && descSection.content.trim().length >= 15) {
      const contentLength = descSection.content.trim().length;
      if (contentLength > 50) {
        details.push({ name: 'Project Description', score: 25, maxScore: 25, status: 'success', message: 'Found (> 50 chars)' });
        totalScore += 25;
      } else {
        details.push({ name: 'Project Description', score: 10, maxScore: 25, status: 'warning', message: 'Found but very brief (< 50 chars)' });
        totalScore += 10;
        suggestions.push('Expand your Project Description to be more than 50 characters.');
      }
    } else if (descSection && descSection.content.trim().length > 0) {
      details.push({ name: 'Project Description', score: 0, maxScore: 25, status: 'error', message: 'Insufficient Content (< 15 chars)' });
      suggestions.push('Add more content to your Project Description.');
    } else {
      details.push({ name: 'Project Description', score: 0, maxScore: 25, status: 'error', message: 'Missing entirely' });
      suggestions.push('Add a Project Description section.');
    }

    // 2. Installation (25 pts)
    const instSynonyms = ['installation', 'setup', 'getting started', 'prerequisites', 'deployment'];
    const instSection = MarkdownParser.findSection(sections, instSynonyms);
    
    if (instSection && instSection.content.trim().length >= 15) {
      const hasCodeBlock = /```[\s\S]*?```/.test(instSection.content);
      const hasList = /^[-*+]\s|\d+\.\s/m.test(instSection.content);
      
      if (hasCodeBlock || hasList) {
        details.push({ name: 'Installation', score: 25, maxScore: 25, status: 'success', message: 'Found with code blocks/lists' });
        totalScore += 25;
      } else {
        details.push({ name: 'Installation', score: 15, maxScore: 25, status: 'warning', message: 'Found but lacks code blocks or lists' });
        totalScore += 15;
        suggestions.push('Add code blocks or structured lists to your Installation section.');
      }
    } else if (instSection && instSection.content.trim().length > 0) {
      details.push({ name: 'Installation', score: 0, maxScore: 25, status: 'error', message: 'Insufficient Content (< 15 chars)' });
      suggestions.push('Add more content to your Installation section.');
    } else {
      details.push({ name: 'Installation', score: 0, maxScore: 25, status: 'error', message: 'Missing entirely' });
      suggestions.push('Add an Installation section.');
    }

    // 3. Usage (25 pts)
    const usageSynonyms = ['usage', 'how to use', 'examples', 'running the app', 'quick start'];
    const usageSection = MarkdownParser.findSection(sections, usageSynonyms);

    if (usageSection && usageSection.content.trim().length >= 15) {
      const hasCodeBlock = /```[\s\S]*?```/.test(usageSection.content);
      
      if (hasCodeBlock) {
        details.push({ name: 'Usage', score: 25, maxScore: 25, status: 'success', message: 'Found with code examples' });
        totalScore += 25;
      } else {
        details.push({ name: 'Usage', score: 10, maxScore: 25, status: 'warning', message: 'Found but lacks code blocks/examples' });
        totalScore += 10;
        suggestions.push('Provide code examples in your Usage section.');
      }
    } else if (usageSection && usageSection.content.trim().length > 0) {
      details.push({ name: 'Usage', score: 0, maxScore: 25, status: 'error', message: 'Insufficient Content (< 15 chars)' });
      suggestions.push('Add more content to your Usage section.');
    } else {
      details.push({ name: 'Usage', score: 0, maxScore: 25, status: 'error', message: 'Missing entirely' });
      suggestions.push('Add a Usage section.');
    }

    // 4. Author Information (25 pts)
    const authorSynonyms = ['author', 'authors', 'maintainer', 'contact', 'credits', 'creator'];
    const authorSection = MarkdownParser.findSection(sections, authorSynonyms);

    if (authorSection && authorSection.content.trim().length >= 15) {
      const hasLinkOrEmail = /\[.*?\]\(.*?\)|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|@[\w]+/.test(authorSection.content);
      
      if (hasLinkOrEmail) {
        details.push({ name: 'Author Info', score: 25, maxScore: 25, status: 'success', message: 'Found with contact link/email' });
        totalScore += 25;
      } else {
        details.push({ name: 'Author Info', score: 15, maxScore: 25, status: 'warning', message: 'Found but lacks contact link/email' });
        totalScore += 15;
        suggestions.push('Add an email, website link, or social handle to your Author section.');
      }
    } else if (authorSection && authorSection.content.trim().length > 0) {
      details.push({ name: 'Author Info', score: 0, maxScore: 25, status: 'error', message: 'Insufficient Content (< 15 chars)' });
      suggestions.push('Add more content to your Author section.');
    } else {
      details.push({ name: 'Author Info', score: 0, maxScore: 25, status: 'error', message: 'Missing entirely' });
      suggestions.push('Add an Author/Contact section.');
    }

    // Modifiers
    if (fileSize < 200) {
      details.push({ name: 'File Size Penalty', score: -10, maxScore: 0, status: 'error', message: 'File is smaller than 200 bytes' });
      totalScore -= 10;
      suggestions.push('Expand your README. It is currently too short (< 200 bytes).');
    }

    const bonusSynonyms = ['license', 'contributing'];
    const bonusSection = MarkdownParser.findSection(sections, bonusSynonyms);
    if (bonusSection) {
      details.push({ name: 'Bonus (License/Contributing)', score: 5, maxScore: 0, status: 'success', message: 'Found License or Contributing section' });
      totalScore += 5;
    }

    // Cap score at 100 and floor at 0
    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      fileSize,
      totalScore,
      details,
      suggestions
    };
  }
}
