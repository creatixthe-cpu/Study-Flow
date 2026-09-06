// Web Screen Wake Lock Service
// Keeps the screen on while the study timer is active without draining unnecessary battery

class WakeLockService {
  private sentinel: any = null;
  private isRequested: boolean = false;
  private onStatusChangeCallback: ((isActive: boolean) => void) | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public setStatusListener(callback: (isActive: boolean) => void) {
    this.onStatusChangeCallback = callback;
  }

  public async acquire(): Promise<boolean> {
    this.isRequested = true;
    if (!this.isSupported()) {
      console.warn('Screen Wake Lock API not supported in this environment');
      return false;
    }

    try {
      if (!this.sentinel || this.sentinel.released) {
        // @ts-ignore
        this.sentinel = await navigator.wakeLock.request('screen');
        
        this.sentinel.addEventListener('release', () => {
          if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(false);
          }
        });

        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(true);
        }
        return true;
      }
      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      return false;
    }
  }

  public async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      } finally {
        this.sentinel = null;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(false);
        }
      }
    }
  }

  public isActive(): boolean {
    return !!(this.sentinel && !this.sentinel.released);
  }

  private handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && this.isRequested) {
      await this.acquire();
    }
  };
}

export const wakeLockService = new WakeLockService();
