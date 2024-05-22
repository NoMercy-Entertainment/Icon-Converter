
import { PathLike, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import ProgressBar from 'progress';
import { Command } from 'commander';
import packageJson from '../package.json';

declare module 'commander' {
    interface Command {
        option(flags: string, description?: string | undefined, defaultValue?: string | boolean | string[] | undefined | null): Command;
        opts(): Options;
    }
}

interface Options {
    debug: boolean;
    sprite: boolean;
    icons: boolean;
    id: boolean;
    removeSize: boolean;
    colors: boolean;
    removeStyle: boolean;
    strokeWidth: string | null;
    stroke: string | null;
    fill: string | null;
    forceStroke: boolean;
    forceFill: boolean;
    optimize: boolean;
    output: string;
    input: string;
}

const optimalOptions: Partial<Options> = {
    sprite: true,
    icons: true,
    stroke: 'currentColor',
    fill: 'currentColor',
    id: true,
    removeSize: true,
    colors: true,
    removeStyle: true,
    strokeWidth: null,
    forceStroke: false,
    forceFill: false,
}
const defaultOptions: Partial<Options> = {
    debug: false,
    sprite: false,
    icons: false,
    stroke: null,
    fill: null,
    id: false,
    removeSize: false,
    colors: false,
    removeStyle: false,
    strokeWidth: null,
    forceStroke: false,
    forceFill: false,
    optimize: false,
}

const program = new Command();

program
  .name('iconConverter.js')
  .description('Converts SVG icons to a sprite and individual icon files.')
  .version(packageJson.version);

program
    .option('--input <input>', "Path to the input folder", resolve(__dirname, '..', 'input'))
    .option('--output <output>', "Path to the output folder", resolve(__dirname, '..', 'output'))
    .option('--debug', "Show all log messages", defaultOptions.debug)
    .option('--optimize', "Loads optimal options", false)
    .option('--sprite', "Generates a sprite.svg file with all icons.", defaultOptions.sprite)
    .option('--icons', "Generates individual icon files.", defaultOptions.icons)

    .option('--fill <fill>', "default fill color", defaultOptions.fill)
    .option('--id', "Adds an id to each icon.", defaultOptions.id)
    .option('--remove-size', "Removes width and height.", defaultOptions.removeSize)
    .option('--remove-style', "Removes the style attribute.", defaultOptions.removeStyle)

    .option('--colors', "Changes the fill and stroke colors.", defaultOptions.colors)
    .option('--stroke <stroke>', "default stroke color", defaultOptions.stroke)
    .option('--stroke-width <strokeWidth>', "Changes the stroke width", defaultOptions.strokeWidth)
    .option('--force-stroke', "Sets the stroke color if it's none.", defaultOptions.forceStroke)
    .option('--force-fill', "Sets the fill color if it's none.", defaultOptions.forceFill)
    

program.parse();

const files = getAllFiles(program.opts().input as string);

if (!existsSync(program.opts().input)){
    mkdirSync(program.opts().input, { recursive: true });
}

let options: Partial<Options> = program.opts();

if (options.optimize) {
    options = {
        ...optimalOptions,
        debug: program.opts().debug,
        sprite: program.opts().sprite,
        icons: program.opts().icons,
    };
}

if (options.debug)
    console.table(options);

if (!options.sprite && !options.icons){
    console.error('Please select at least one option: --sprite or --icons');
    process.exit(1);
}

if (options.stroke && !options.colors){
    console.error('Please enable --colors to use --stroke');
    process.exit(1);
}

if (options.fill && !options.colors){
    console.error('Please enable --colors to use --fill');
    process.exit(1);
}

function replaceNumbersWithWords(str: string): string {
    return str.replace(/^\d+/, function(match) {
        switch (match) {
            case '1': return 'one';
            case '2': return 'two';
            case '3': return 'three';
            case '4': return 'four';
            case '5': return 'five';
            case '6': return 'six';
            case '7': return 'seven';
            case '8': return 'eight';
            case '9': return 'nine';
            case '10': return 'one-k';
            case '11': return 'eleven';
            case '12': return 'twelve';
            case '13': return 'thirteen';
            case '14': return 'fourteen';
            case '15': return 'fifteen';
            case '16': return 'sixteen';
            case '17': return 'seventeen';
            case '18': return 'eighteen';
            case '19': return 'nineteen';
            case '20': return 'twenty';
            case '21': return 'twenty-one';
            case '22': return 'twenty-two';
            case '23': return 'twenty-three';
            case '24': return 'twenty-four';
            case '30': return 'thirty';
            case '60': return 'sixty';
            case '90': return 'ninety';
            case '100': return 'one-hundred';
            case '200': return 'two-hundred';
            case '300': return 'three-hundred';
            case '360': return 'three-sixty';
            default: return match;
        }
    });
}

function addColor(str: string) {
    str = str
        .replace(/stroke="#\w+"/g, `stroke="${options.stroke || "$&"}"`)
        .replace(/fill="#\w+"/g, `fill="${options.stroke || "$&"}"`)

    if (options.forceStroke && options.stroke)
        str = str.replace(/stroke="none"/g, `stroke="${options.stroke}"`)

    if (options.forceFill && options.fill)
        str = str.replace(/fill="none"/g, `fill="${options.fill}"`)

    return str;
}

function removeStyles(str: string) {
    return str.replace(/style="[\w\d\s\.#;:\(\)_-]+"\s/g, '')
}

function removeSize(str: string) {
    return str
        .replace(/height="\d+"\s/g, '')
        .replace(/width="\d+"\s/g, '')
        .replace(/stroke-width="([\d\.]+)"/, `stroke-width="${options.strokeWidth || "$1"}"`)

}

function addId(str: string, id: string) {
    return str
        .replace(/<svg/, '<svg id="' + id + '"')
}

function spritize(str: string) {
    return str
        .replace(/stroke-width="([\d\.]+)"/, `stroke-width="var(--stroke-width, ${options.strokeWidth || "$1"})"`)
        .replace(/<svg /, '<symbol ')
        .replace(/<\/svg>/, '</symbol>')
}

function getAllFiles(inputFolder: string, files: string[] = []){

    if (inputFolder == program.opts().input && readdirSync(inputFolder).length == 0){
        console.error(`No input files found, please add your icons in "${inputFolder}".`);
        process.exit(1);
    }

    const folders = readdirSync(inputFolder)
        .filter(path => lstatSync(resolve(inputFolder, path)).isDirectory());
        
    readdirSync(inputFolder)
        .filter(path => path.endsWith('.svg'))
        .forEach(path => files.push(resolve(inputFolder, path)));
    
    for (const folder of folders) {
        getAllFiles(resolve(inputFolder, folder), files);
    }

    return files;
}

function cleanOutput(output: PathLike, iconOutput: PathLike) {
    rmSync(output, { recursive: true, force: true });
    mkdirSync(output, { recursive: true });
    
    if (options.icons) {
        rmSync(iconOutput, { recursive: true, force: true });
        mkdirSync(iconOutput, { recursive: true });
    }
}

function log(message: string, type: string = 'debug') {
    if (options.debug && options[type as keyof typeof Option]) console.log(message);
}

function makeFileName(file: string, at = -1): string {

    // remove all spaces, dashes and dots and make it camelCase make it camelCase
    const newFile = file
        .split('\\').at(at)!
        .split('.').at(0)!
        .split('-')
        .map((part, i) => i == 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
        .join('')!;

    return removeSpecialCharacters(newFile);
}

function removeSpecialCharacters(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '');
}

function duplicateNames(array: string[]) {
    return array
        .map((item) => makeFileName(item))
        .filter((item, index, arr) => arr.indexOf(item) !== index);
}

const renamedIcons: {
    input: string, output: string
}[] = [];

function makeIconName(file: string): string {

    let name = makeFileName(file);
    
    if (duplicateNames(files).includes(name)){

        const newName = name.charAt(0).toUpperCase() + name.slice(1);

        const folderName = makeFileName(file, -2);

        name = newName + folderName;

        renamedIcons.push({
            input: file,
            output: name
        });
    }

    return name;
}

function processIcons(){

    const output = resolve(program.opts().output as string);
    const iconOutput = resolve(output, 'icons');
    
    cleanOutput(output, iconOutput);

    const sprite: string[] = [];

    sprite.push('<svg width="0" height="0" style="display: none;">\n');

    let exampleName: string = '';

    console.log();
    var bar = new ProgressBar(`Processing icons [:bar] :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: files.length
    });

    for (const file of files.reverse()) {

        let name: string = makeIconName(file);
    
        name = replaceNumbersWithWords(name);
    
        let fileContents = readFileSync(file, 'utf8');

        if (options.id)
            fileContents = addId(fileContents, name);
        
        if (options.removeSize)
            fileContents = removeSize(fileContents);

        if (options.colors)
            fileContents = addColor(fileContents);

        if (options.removeStyle)
            fileContents = removeStyles(fileContents);
    
        sprite.push(spritize(fileContents));
    
        if (options.icons){
            writeFileSync(`${iconOutput}/${name}.svg`, fileContents, 'utf8');
        }

        if (!exampleName) exampleName = name;
        
        bar.tick(1);
    }

    sprite.push('\n</svg>');

    const spriteFile = resolve(output, 'sprite.svg');
    const spriteUseExampleFile = resolve(output, 'use-example.html');
    
    if (options.sprite){

        log(`Writing sprite.svg`);

        writeFileSync(spriteFile, sprite.join("") , 'utf8');

        const spriteUseExample = [
            `<svg class="w-6 h-auto aspect-square">`,
            `    <use xlink:href="sprite.svg#${exampleName}"></use>`,
            `</svg>`
        ].join("\n");
        
        writeFileSync(spriteUseExampleFile, spriteUseExample, 'utf8');
    }

    console.log();
    console.log('Output:', output);
    console.log();

    if (options.sprite){
        console.log('Sprite:', spriteFile);
        console.log('Sprite use example:', spriteUseExampleFile);
    }
    console.log('');

    if (renamedIcons.length > 0){
        console.error('Duplicate names found, We are renamed the following icons to avoid conflicts');
        console.table(renamedIcons);
    }

}

processIcons();

export default {};
