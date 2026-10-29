// ============================================================
// Mochi – Update Manager
// ============================================================
import { shell } from 'electron';

const RELEASES_URL = 'https://github.com/your-org/mochi-cat/releases';

export class UpdateManager {
  checkForUpdates(): void {
    // Open releases page — real auto-update requires a configured update server
    shell.openExternal(RELEASES_URL);
  }
}
