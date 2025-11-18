module.exports = {
  webpack: {
    configure: (config) => {
      config.output = config.output || {};
      config.output.chunkFormat = 'array-push';
      config.experiments = config.experiments || {};
      config.experiments.outputModule = false;
      return config;
    },
  },
};