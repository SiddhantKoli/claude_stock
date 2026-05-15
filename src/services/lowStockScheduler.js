/**
 * lowStockScheduler.js
 * Monitors inventory and triggers auto-reorder when stock falls below threshold.
 * Runs periodically (default: every 5 minutes) to check all items.
 */

/**
 * LowStockScheduler class
 * Manages periodic inventory checks and auto-reorder triggers
 */
export class LowStockScheduler {
  constructor(intervalMinutes = 5) {
    this.intervalMinutes = intervalMinutes;
    this.intervalId = null;
    this.isRunning = false;
    this.lastRun = null;
    this.runCount = 0;
  }

  /**
   * Start the scheduler
   * @param {Function} checkFn - Async callback to run periodically
   */
  start(checkFn) {
    if (this.isRunning) {
      console.warn("[AEGIS SCHEDULER] Already running");
      return;
    }

    this.isRunning = true;
    console.log(`[AEGIS SCHEDULER] Started (interval: ${this.intervalMinutes}m)`);

    // Run immediately on start
    this._executeCheck(checkFn);

    // Then schedule recurring checks
    this.intervalId = setInterval(
      () => this._executeCheck(checkFn),
      this.intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.intervalId = null;
    console.log("[AEGIS SCHEDULER] Stopped");
  }

  /**
   * Execute the check function
   * @param {Function} checkFn
   */
  async _executeCheck(checkFn) {
    try {
      this.lastRun = new Date();
      this.runCount++;

      console.log(
        `[AEGIS SCHEDULER] Run #${this.runCount} at ${this.lastRun.toLocaleTimeString()}`
      );

      const result = await checkFn();
      
      if (result && result.length > 0) {
        const triggered = result.filter((r) => r.success);
        const failed = result.filter((r) => !r.success);
        
        console.log(
          `[AEGIS SCHEDULER] Check complete: ${triggered.length} auto-reorders triggered, ${failed.length} skipped`
        );
      } else {
        console.log("[AEGIS SCHEDULER] No auto-reorders needed");
      }
    } catch (err) {
      console.error("[AEGIS SCHEDULER ERROR]", err);
    }
  }

  /**
   * Get scheduler status
   * @returns {object}
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      lastRun: this.lastRun,
      runCount: this.runCount,
    };
  }
}

/**
 * Factory function to create a scheduler instance
 * @param {number} intervalMinutes - Check interval in minutes
 * @returns {LowStockScheduler}
 */
export function createLowStockScheduler(intervalMinutes = 5) {
  return new LowStockScheduler(intervalMinutes);
}
