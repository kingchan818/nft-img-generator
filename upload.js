const {NFTStorage, File} = require('nft.storage')
const client = new NFTStorage({ token: process.env.API_KEY })
const fs = require('fs');

const { priorities,dir,PROJECT_NAME,imageFormat } = require('./config');



const file = fs.readFileSync(`${dir.outputs}/metadata/1.json`)
const metadata = JSON.parse(file)
console.log(metadata)