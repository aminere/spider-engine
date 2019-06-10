
module.exports = env => {
  env = env || 'web.dev';
  console.log(`env: ${env}`);
  return require(`./webpack.${env}.js`);
};
