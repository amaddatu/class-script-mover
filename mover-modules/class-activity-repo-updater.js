const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
// import shell from 'shelljs';
const prompt = inquirer.prompt;


class ClassActivityRepoUpdater {
    /**
     * This assists in clearing and organizing the class repo
     * @param {*} hg this is the HelperGlobal Object
     */
    constructor(hg){
        this.hg = hg;
        this.class_repo = hg.class_repo_default;
        this.activity_directory = hg.activity_directory_default;
    }

    start(){
        this.askForGitRepo();
    }

    askForGitRepo(){
        this.hg.askForFsfRepo( fsf_git_repo => {
            this.fsf_git_repo = fsf_git_repo;
            this.askForClassRepoDirectory();
        });
    }

    askForClassRepoDirectory(){
        this.hg.askForClassRepo( class_repo => {
            this.class_repo = class_repo;
            this.next();
        });
    }
    next(){
        console.log(this);
    }
}

module.exports = {
    /**
     * This will start the lesson mover
     * @param {*} hg This is the helper global object
     */
    start(hg){
        let cru = new ClassActivityRepoUpdater(hg);
        return cru.start();
    }
}