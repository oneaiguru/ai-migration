import { homedir } from 'os';
import { globSync } from 'glob';
import { resolve } from 'path';

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
