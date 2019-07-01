const LaunchDarklySDK = require('launchdarkly-node-server-sdk');

// TODO: need a way to monitor the timings here via New Relic
// Can something be pass into the instance that can facilitate this?
// That way this class doesn't need to know about New Relic
module.exports = class LaunchDarkly {
  launchDarklyClient = null;

  // Defaults when initializing LaunchDarkly
  ldConfigDefaults = {
    timeout: 1, // LaunchDarkly uses this, in seconds
    customTimeout: 200, // For this wrapper, in milliseconds
  };

  // Defaults when getting a key's value
  ldKeyConfigDefaults = {};

  isReady = false;

  readyListeners = [];

  /**
   * Apply a custom configuration when initializing LaunchDarkly
   * Can optionally await when calling configure
   * This is not a constructor so that users can await it if desired
   * 
   * @param {*} config 
   * @returns Promise
   */
  configure(config) {
    config = Object.assign({}, this.ldConfigDefaults, config);

    this.launchDarklyClient = LaunchDarklySDK.init(process.env.LAUNCHDARKLY_KEY, config);

    // Flag ready and resolve all of the ready listeners
    const ready = () => {
      this.isReady = true;
      this.readyListeners.forEach((resolve) => resolve());
    }

    return new Promise((resolve, reject) => {
      // This is our own failsafe timeout
      setTimeout(() => {
        if (this.isReady) {
          // Already resolved
          return;
        }

        ready();
        resolve();
      }, config.customTimeout);

      // Ideally LaunchDarkly will finish first
      this.launchDarklyClient.waitForInitialization().then(() => {
        if (this.isReady) {
          // Already resolved
          return;
        }

        ready();
        resolve();
      });
    });
  }

  /**
   * Wait for the signal that LaunchDarkly is ready
   * Or that the custom timeout has been hit
   * Otherwise, just return if ready
   * 
   * @returns Promise
   */
  async waitForReady() {
    if (this.isReady) {
      return;
    }

    await new Promise((resolve) => {
      this.readyListeners.push(resolve);
    })
  }

  /**
   * Get a key. This will initialize LaunchDarkly if necessary,
   * and wait for it to be ready
   * 
   * https://docs.launchdarkly.com/docs/node-sdk-reference#section-variation
   * 
   * @param {*} key 
   * @param {*} user 
   * @param {*} defaultValue 
   * @param {*} config
   * @returns Promise
   */
  async getFlag(flagKey, user, defaultValue, config) {
    config = Object.assign({}, this.ldKeyConfigDefaults, config);

    if (!this.launchDarklyClient) {
      await this.configure();
    }

    // Wait for the ready signal from LaunchDarkly or the custom timeout
    await this.waitForReady();

    try {
      return await this.launchDarklyClient.variation(flagKey, user, defaultValue);
    } catch (e) {
      return defaultValue;
    }
  };

  /**
   * Track actions. These only apply to goals, which we don't currently use
   * 
   * https://docs.launchdarkly.com/docs/node-sdk-reference#section-track
   * 
   * @returns Promise
   */
  track(actions, user) {
    return this.launchDarklyClient.track(actions, user);
  }

  /**
   * Flush and close the LaunchDarkly client
   * 
   * https://docs.launchdarkly.com/docs/node-sdk-reference#section-flush
   * https://docs.launchdarkly.com/docs/node-sdk-reference#section-close
   */
  async flushAndClose() {
    // Flush it just to be sure any events are sent
    await this.launchDarklyClient.flush();
    this.launchDarklyClient.close();
  }

  /**
   * Just close the LaunchDarkly client
   * 
   * https://docs.launchdarkly.com/docs/node-sdk-reference#section-close
   */
  close() {
    this.launchDarklyClient.close();
  }

  /**
   * Get data about the flags that apply to the given user
   * 
   * @param {*} user 
   */
  async getUserFlagsState(user) {
    await this.launchDarklyClient.allFlagsState(user).toJSON();
  }
}
