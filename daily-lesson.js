const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const shell = require('shelljs');
const hg = require('./mover-modules/helper-global');
const lessonMover = require('./mover-modules/lesson-mover');
const prompt = inquirer.prompt;


//go to the current directory of the script
shell.cd(__dirname);

lessonMover.start(hg());

//askForFsfRepo(fsf_git_repo_default, lesson_plan_directory_default);
//askForActivityDirectory(fsf_git_repo_default, activity_directory_default);