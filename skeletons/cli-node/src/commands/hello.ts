import { Command } from 'commander';
import pc from 'picocolors';

export function helloCommand(): Command {
  return new Command('hello')
    .description('Print a greeting. Replace with your real commands.')
    .argument('[name]', 'who to greet', 'world')
    .action((name: string) => {
      process.stdout.write(`Hello, ${pc.cyan(name)}!\n`);
    });
}
