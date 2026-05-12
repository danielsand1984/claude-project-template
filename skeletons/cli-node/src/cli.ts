#!/usr/bin/env node
import { Command } from 'commander';
import { helloCommand } from './commands/hello.js';

const program = new Command()
  .name('{{PROJECT_NAME}}')
  .description('{{PROJECT_DESCRIPTION}}')
  .version('0.1.0')
  .option('-v, --verbose', 'verbose logging')
  .option('-q, --quiet', 'errors only');

program.addCommand(helloCommand());

program.parseAsync(process.argv).catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
});
