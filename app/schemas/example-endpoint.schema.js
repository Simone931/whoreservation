const endpointSchema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          cognome: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
};

const paths = {
  in: [],
  out: ['cognome', 'nome'],
};

module.exports = {
  endpointSchema,
  paths,
};
