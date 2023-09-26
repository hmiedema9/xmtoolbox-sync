//post-build script to prepare built files to be checked in.

const fs = require('fs');

const reMain = /static\/media\/(\w+\.)+(gif)/g;
const reSub = /\w+/g;

//open index.html
// part example:
//let html = 'tion",{value:e.value,children:e.name},e.value)}))}),g&&m]})},h=n.p+"static/media/WorkflowSetup.99b7d6c8.gif",j=n.p+"static/media/CreateXMPW.678654f4.gif",p=function(e){va';
const sourceHtmlFileName = './build/index.html';
let html = fs.readFileSync(sourceHtmlFileName, 'utf8');
console.log('reading file', sourceHtmlFileName);

//find gif paths in file
const matches = html.match(reMain);

//replace  gif paths in file
for (let i = 0; i < matches.length; i++) {
    const oldString = matches[i];
    const match = matches[i].match(reSub);
    const newString = 'assets/' + match[2] + '.' + match[4];
    console.log('replacing file name in html', oldString, 'with', newString);
    html = html.replace(oldString, newString);
}

//console.log(html);

//save output as configurator.html
const htmlFileName = '../configurator.html';
console.log('writting file', htmlFileName);
fs.writeFileSync(htmlFileName, html);

if (fs.existsSync('./www')) {
    console.info('./www directory found. Building deployable configurator.');
    fs.mkdirSync('./www/assets', { recursive: true });
    fs.writeFileSync('./www/index.html', html);
    //copy all files to www for hosting
    const buildFiles = fs.readdirSync('../assets');
    for (let i = 0; i < buildFiles.length; i++) {
        const buildFile = buildFiles[i];

        fs.copyFileSync('../assets/' + buildFile, './www/assets/' + buildFile);
    }

    //for hosting on heroku
    fs.writeFileSync('./www/composer.json', '{}');
    fs.writeFileSync('./www/index.php', '<?php include_once("index.html"); ?>');
}
