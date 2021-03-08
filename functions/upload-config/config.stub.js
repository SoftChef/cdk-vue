const $_stubConfig = () => {
  return {
    context: '$_stubContext',
    unpack() {
      return JSON.parse(new TextDecoder().decode(
        Uint8Array.from(
          atob(this.context),
          c => c.charCodeAt(0)
        )
      ));
    },
    get(key) {
      const keys = key.split('.');
      let result;
      for (let key of keys) {
        if (result === undefined) {
          result = this.unpack()[key];
        } else if (result[key] !== undefined) {
          result = result[key];
        }
      }
      return result;
    },
    has(key) {
      return this.get(key);
    }
  }
};

window.CloudDeploymentConfig = {
  install(Vue, options = {}) {
    Object.defineProperties(Vue.prototype, {
      $config: {
        get() {
          return $_stubConfig();
        }
      }
    });
  }
};