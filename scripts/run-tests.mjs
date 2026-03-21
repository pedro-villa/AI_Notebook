import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const withCoverage = args.includes('--coverage');
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const run = (cwd, cmdArgs) => {
  const command = `${npmBin} ${cmdArgs.join(' ')}`;
  const result = spawnSync(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  if (result.error) {
    console.error(`Failed to run ${command} in ${cwd}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (withCoverage) {
  run('client', ['run', 'test:coverage']);
  run('server', ['run', 'test:coverage']);
} else {
  run('client', ['run', 'test']);
  run('server', ['run', 'test']);
}
