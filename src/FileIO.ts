import fs from 'fs';
import path from 'path';

export class FileIO {
  /**
   * Reads a file and returns its content and size.
   * Handles OS-level errors like file not found, empty file, and permission denied.
   */
  static readFile(filePath: string): { content: string; size: number; warning?: string } {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File Not Found: Could not find file at ${absolutePath}`);
    }

    let warning: string | undefined;
    const ext = path.extname(absolutePath).toLowerCase();
    if (ext !== '.md') {
      warning = `Warning: The tool is optimized for .md files, but attempting to parse ${ext} file anyway.`;
    }

    try {
      const stats = fs.statSync(absolutePath);
      if (stats.size === 0) {
        throw new Error('Empty File: The file exists but is 0 bytes.');
      }

      const content = fs.readFileSync(absolutePath, 'utf-8');
      return { content, size: stats.size, warning };
    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw new Error(`Permission Denied: No read permissions for file at ${absolutePath}`);
      }
      throw error;
    }
  }
}
