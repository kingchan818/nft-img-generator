const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { priorities,dir,PROJECT_NAME,imageFormat } = require('./config');

let totalOutputs = 0;

const main = async (numberOfOutputs) => {
  const traitTypesDir = dir.traitTypes;

  // set all priotised layers to be drawn first.
  // for eg: punk type, top... You can set these values in the priorities array in line 21

  const traitTypes = priorities.map(
    (traitType) => {
      if (traitType.strict) {
        return dataPreparation(traitTypesDir, traitType);
      }
      return dataPreparation(traitTypesDir, traitType).concat({ trait_type: traitType.type, value: 'N/A' }).concat({ trait_type: traitType.type, value: 'N/A' })
    },
  );

  const backgrounds = fs.readdirSync(dir.background);

  // trait type avail for each punk
  const combinations = allPossibleCases(traitTypes, undefined);

  let randomIndexes = [];

  for(let i=0; i < numberOfOutputs; i++){
    const randomNumFromCombination = Math.floor(Math.random() * combinations.length)
    randomIndexes.push(randomNumFromCombination)
  }

  let nonRepeatedIndexes = randomIndexes.filter((v) => v === v);

  const createJob = async (randomIndex, n)=> {
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    await drawImage(combinations[randomIndex], randomBackground, n)
  }

  /**
   * Start Jobs
   */
  for (let n = 0; n < numberOfOutputs ; n++) {
    await createJob(nonRepeatedIndexes[n],n)
  }

};

const dataPreparation = (traitTypesDir, traitType) => fs.readdirSync(`${traitTypesDir}/${traitType.type}/`)
  .map((value) => ({ trait_type: traitType.type, value }))
  .filter((trait) => trait.value !== '.DS_Store');

const recreateOutputsDir = () => {
  if (fs.existsSync(dir.outputs)) {
    fs.rmdirSync(dir.outputs, { recursive: true });
  }
  fs.mkdirSync(dir.outputs);
  fs.mkdirSync(`${dir.outputs}/metadata`);
  fs.mkdirSync(`${dir.outputs}/${PROJECT_NAME}`);
};

const allPossibleCases = (arraysToCombine, max) => {
  const divisors = [];
  let permsCount = 1;

  for (let i = arraysToCombine.length - 1; i >= 0; i--) {
    divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
    permsCount *= (arraysToCombine[i].length || 1);
  }

  if (!!max && max > 0) {
    permsCount = max;
  }

  totalOutputs = permsCount;

  const getCombination = (n, arrays, divisors) => arrays.reduce((acc, arr, i) => {
    acc.push(arr[Math.floor(n / divisors[i]) % arr.length]);
    return acc;
  }, []);

  const combinations = [];
  for (let i = 0; i < permsCount; i++) {
    combinations.push(getCombination(i, arraysToCombine, divisors));
  }

  return combinations;
};

const drawImage = async (traitTypes, background, index) => {
  // draw background
  const canvas = createCanvas(imageFormat.width, imageFormat.height);
  const ctx = canvas.getContext('2d');

  if (background) {
    // draw background
    console.log('======== Draw with background');
    const backgroundIm = await loadImage(`${dir.background}/${background}`);
    ctx.drawImage(backgroundIm, 0, 0, imageFormat.width, imageFormat.height);
    createDrawer(canvas,ctx,traitTypes, index);
  } else {
    ctx.fillStyle = '#ffff'
    ctx.fillRect(0,0,imageFormat.width, imageFormat.height)
    createDrawer(canvas,ctx,traitTypes, index);
  }
};

const createDrawer = async (canvas,ctx,traitTypes, index) => {
  // 'N/A': means that this punk doesn't have this trait type
  let queue = [];

  const drawableTraits = traitTypes.filter((x) => x.value !== 'N/A');

  const drawingPartialImg = async (index) => {
    const val = drawableTraits[index];
    const image = await loadImage(`${dir.traitTypes}/${val.trait_type}/${val.value}`);
    ctx.drawImage(image, 0, 0, imageFormat.width, imageFormat.height);
  }
  for (let index = 0; index < drawableTraits.length; index++) {
    queue.push(drawingPartialImg(index)) 
  }
  await Promise.all(queue)

  console.log(`Progress: ${index + 1}/ ${totalOutputs}`);

  // deep copy
  const metaDrawableTraits = JSON.parse(JSON.stringify(drawableTraits));

  // remove .png from attributes
  metaDrawableTraits.map((x) => {
    x.value = x.value.substring(0, x.value.length - 4);
    return x;
  });

  // save metadata
  fs.writeFileSync(
    `${dir.outputs}/metadata/${index + 1}.json`,
    JSON.stringify({
      name: `${PROJECT_NAME} ${index}`,
      description: 'A guy with laptop Art NFT',
      attributes: metaDrawableTraits,
    }, null, 2),
    (err) => {
      if (err) throw err;
    },
  );

  // save image
  fs.writeFileSync(
    `${dir.outputs}/${PROJECT_NAME}/${index + 1}.png`,
    canvas.toBuffer('image/png'),
  );
};

// main function
(() => {
  recreateOutputsDir();
  main(process.argv[2]);
})();