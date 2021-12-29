const exampleSchema = require('./example-endpoint.schema');

module.exports = {
  paths: [...exampleSchema.paths.in, ...exampleSchema.paths.out],
};
