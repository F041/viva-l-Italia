const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = 'static/img/icons/';
const outputDir = 'static/img/icons/';

async function convertImage(inputFile) {
    const inputPath = path.join(inputDir, inputFile);
    const outputFileName = path.parse(inputFile).name + '.webp';
    const outputPath = path.join(outputDir, outputFileName);

    try {
        await sharp(inputPath)
            .webp()
            .toFile(outputPath);
        console.log(`Successfully converted ${inputFile} to ${outputFileName}`);
    } catch (error) {
        console.error(`Error converting ${inputFile}:`, error);
    }
}

async function convertAllImages() {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

    for (const file of imageFiles) {
        await convertImage(file);
    }
}

convertAllImages();
