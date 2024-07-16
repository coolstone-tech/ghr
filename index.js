#!/usr/bin/env node

const { homedir } = require('os');
const{ writeFileSync, existsSync, mkdirSync, rmdirSync } = require('fs');
const { get } = require('https');
const { execSync } = require('child_process');

const flags = ['--c', '--clear', '--skip-deps', '--skip-dependencies', '--sd', '--keep', '--k'];

const removeFlags = (str='') => {
    let newStr = str;
    flags.forEach(flag => {
        newStr = newStr.replace(flag, ' ');
    });
    return newStr.trim();
}

const repo = process.argv[2];

if(repo == '--clean'){
if(existsSync(`${homedir()}/.ghr`)){
    console.log('Cleaning up...');
    rmdirSync(`${homedir()}/.ghr`, { recursive: true });
    console.log('Cleaned up successfully!');
    process.exit(0);
}else{
    console.log('Nothing to clean up!');
    process.exit(0);
}
}

const branch = removeFlags(process.argv[3]) || 'master';
const file = removeFlags(process.argv[4]) || 'index.js';
const tempPath = removeFlags(process.argv[5]).replace('~', homedir()) || `${homedir()}/.ghr`;
const clearAfter = process.argv.includes('--c') || process.argv.includes('--clear');
const skipDeps = process.argv.includes('--skip-deps') || process.argv.includes('--skip-dependencies') || process.argv.includes('--sd');
const keep = process.argv.includes('--keep') || process.argv.includes('--k');

if(!repo) {
    console.log('Usage: ghr <repo> <branch?> <files?> <tempPath?>');
    process.exit(1);
}

if(!existsSync(tempPath)) {
 mkdirSync(tempPath, { recursive: true });
}

if (skipDeps) {
    console.log('Skipping dependencies...');
    file.split(',').forEach((f) => {
        console.log(`Fetching ${f}...`);
        getScriptFile(f.trim());
    })
} else {
    console.log('Fetching dependencies...');
    get(`https://raw.githubusercontent.com/${repo}/${branch}/package.json`, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log('Dependencies fetched successfully! Installing...');
            writeFileSync(`${tempPath}/package.json`, data);
            execSync('npm install', {
                cwd: tempPath,
                stdio: 'inherit'
            })
            console.log('Dependencies installed successfully! Fetching script file...');
            file.split(',').forEach((f) => {
                console.log(`Fetching ${f}...`);
                getScriptFile(f.trim());
            })
        });

    }).on('error', (error) => {
        console.error(error);
    });
}

function getScriptFile(file) {
    get(`https://raw.githubusercontent.com/${repo}/${branch}/${file}`, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log(`Script file ${file} fetched successfully!`);
            writeFileSync(`${tempPath}/${file}`, data);
            if (allScriptsDownloaded()) {
                console.log('All scripts downloaded successfully! Running index.js...');
                if (clearAfter) console.clear();
                execSync('node index.js', {
                    cwd: tempPath,
                    stdio: 'inherit'
                });
            }
        });

    }).on('error', (error) => {
        console.error(error);
    });
}

let scriptCount = file.split(',').length;
let downloadedScripts = 0;

function allScriptsDownloaded() {
    downloadedScripts++;
    if (downloadedScripts === scriptCount) return true;
    return false;
}


process.on('exit', () => {
    if (!keep && existsSync(tempPath)) {
        console.log('\nCleaning up...');
     rmdirSync(tempPath, { recursive: true });
        console.log('Cleaned up successfully!');
    }
    })