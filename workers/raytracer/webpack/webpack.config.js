module.exports = function (config) {
	
  if (!config) {
	  config = 'worker.dev';
  }  
	
  console.log(`config: ${config}`);
  return require(`./${config}.js`)
}
