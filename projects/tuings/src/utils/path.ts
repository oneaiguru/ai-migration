import { homedir } from 'os';
import { globSync } from 'glob';
import { resolve, dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

export function expandHomeDir(path: string): string {
  if (path.startsWith('~/')) {
    return resolve(homedir(), path.slice(2));
  }
  return path;
}

export function findThingsDatabase(): string | null {
  const pattern = expandHomeDir(
    '~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-*/Things Database.thingsdatabase/main.sqlite'
  );
  
  const matches = globSync(pattern);
  return matches.length > 0 ? matches[0] : null;
}

export function resolveThingsDatabasePath(): string {
  // Allow an environment variable override for tests and custom setups
  const envPath = process.env.THINGS_DB_PATH || process.env.THINGS_DATABASE_PATH;
  if (envPath) {
    return expandHomeDir(envPath);
  }

  const found = findThingsDatabase();
  if (found) {
    return found;
  }

  // As a fallback for dev/test environments, ensure a deterministic local path exists
  const fallbackPath = resolve(process.cwd(), 'test-data', 'things', 'main.sqlite');
  const dir = dirname(fallbackPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(fallbackPath)) {
    writeFileSync(fallbackPath, '');
  }
  return fallbackPath;
}
