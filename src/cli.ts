#!/usr/bin/env node
import { Command } from 'commander';
import { FileIO } from './FileIO.js';
import { ScoringEngine } from './ScoringEngine.js';
import pc from 'picocolors';

const program = new Command();

program
  .name('readme-scorer')
  .description('An automated quality assurance tool for README.md files')
  .argument('<path-to-readme>', 'Path to the README.md file to score')
  .option('-f, --format <type>', 'Output format (json or text)', 'text')
  .option('-v, --verbose', 'Print detailed breakdown')
  .action((filePath, options) => {
    try {
      const { content, size, warning } = FileIO.readFile(filePath);
      
      if (options.format !== 'json' && warning) {
        console.log(pc.yellow(warning));
      }

      const report = ScoringEngine.score(content, size);

      if (options.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`\n${pc.bold('📊 README Quality Report for:')} ${pc.cyan(filePath)}`);
        
        for (const detail of report.details) {
          let icon = '';
          let colorFn = pc.white;
          
          if (detail.status === 'success') {
            icon = '✅';
            colorFn = pc.green;
          } else if (detail.status === 'warning') {
            icon = '⚠️ ';
            colorFn = pc.yellow;
          } else {
            icon = '❌';
            colorFn = pc.red;
          }

          const scoreText = detail.maxScore > 0 ? `(${detail.score}/${detail.maxScore} pts)` : `(${detail.score > 0 ? '+' : ''}${detail.score} pts)`;
          console.log(`${icon} ${pc.bold(detail.name)}: ${colorFn(detail.message)} ${scoreText}`);
          
          if (options.verbose && detail.status !== 'success' && detail.maxScore > 0) {
            console.log(`   ${pc.dim('->')} ${pc.gray(`Points lost due to: ${detail.message}`)}`);
          }
        }

        const scoreColor = getScoreColor(report.totalScore);
        const scoreLabel = getScoreLabel(report.totalScore);
        console.log('\n' + pc.bold('🏆 FINAL SCORE: ') + scoreColor(`${report.totalScore}/100`) + ` (${scoreLabel})`);
        
        if (report.suggestions.length > 0) {
          console.log('\n' + pc.bold('💡 Suggestions for improvement:'));
          report.suggestions.forEach(s => console.log(`   - ${s}`));
        }
        console.log('');
      }
    } catch (error: any) {
      if (error.message.startsWith('Empty File')) {
        if (options.format === 'json') {
          console.log(JSON.stringify({ totalScore: 0, error: error.message }, null, 2));
        } else {
          console.log(pc.red(`❌ ${error.message}`));
          console.log('\n' + pc.bold('🏆 FINAL SCORE: ') + pc.red('0/100') + ' (Empty)');
        }
      } else {
        if (options.format === 'json') {
          console.error(JSON.stringify({ error: error.message }, null, 2));
        } else {
          console.error(pc.red(`❌ ${error.message}`));
        }
        process.exit(1);
      }
    }
  });

function getScoreColor(score: number) {
  if (score >= 80) return pc.green;
  if (score >= 50) return pc.yellow;
  return pc.red;
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

program.parse(process.argv);
