const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  style: {
    sass: {
      loaderOptions: {
        additionalData: `
          @use "@/styles/utils/mixins" as mx;
          @use "@/styles/utils/breakpoints" as bp;
        `,
      },
      sassOptions: {
        includePaths: ['./src'],
      },
    },
    postcss: {
      mode: 'extends',
      loaderOptions: {
        implementation: require('postcss'),
      },
    },
  },
};
