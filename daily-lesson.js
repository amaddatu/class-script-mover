const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const shell = require('shelljs');
const hg = require('./mover-modules/helper-global');
const lessonMover = require('./mover-modules/lesson-mover');
const classActivityRepoUpdater = require('./mover-modules/class-activity-repo-updater');
const prompt = inquirer.prompt;


//go to the current directory of the script
shell.cd(__dirname);

lessonMover.start(hg());
// classActivityRepoUpdater.start(hg());