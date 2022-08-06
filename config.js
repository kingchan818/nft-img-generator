const imageFormat = {
  width: 500,
  height: 500,
};

const dir = {
  traitTypes: './nft/trait_types',
  outputs: './outputs',
  background: './nft/background',
};
const PROJECT_NAME = 'guy-with-laptop';

const priorities = [
  {
    type: 'eyes',
    strict: true,
  }, {
    type: 'laptops',
    strict: true,
  }, {
    type: 'mouths',
    strict: true,
  }, {
    type: 'body',
    strict: true,
  }, {
    type: 'bg-styles',
    strict: false,
  }, {
    type: 'styles',
    strict: false,
  },
];

exports.priorities = priorities;
exports.PROJECT_NAME = PROJECT_NAME
exports.imageFormat = imageFormat
exports.dir = dir