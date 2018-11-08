const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const shell = require('shelljs');
const prompt = inquirer.prompt;

class HelperGlobal {
    /**
     * This assists in improving the efficiency of the prompts and allows different prompts to load automatically using well-defined shared variables
     */
    constructor(){
        this.fsf_git_repo_default = "../lesson-plans" //directory of the fsf git repository
        this.lesson_plan_directory_default = "02-lesson-plans/part-time";
        this.daily_lesson_default = "../daily"; //this is the default daily directory - please remember that this directory will be deleted first if chosen
        this.activity_directory_default = "01-Class-Content";
        this.class_repo_default = "../class-repo";
        this.class_repo_set = false;
        this.class_pull_repo_set = true; //can set to true to skip the git pull during testing
        this.fsf_git_repo_set = false;
        this.fsf_git_pull_repo_set = true; //can set to true to skip the git pull during testing
        this.lesson_plan_directory_set = false;
        this.activity_directory_set = false;
        this.basedir = path.dirname(__dirname); //since we are in a sub-folder, we must use this to get the parent directory
    }
    
    /**
     * This will ask the user for the location of the git repo folder
     * @param {*} callback This is a callback function
     */
    askForFsfRepo(callback){
        let fsf_git_repo = this.fsf_git_repo_default;
        if(!this.fsf_git_repo_set){
            prompt([
                {
                    name: "fsf_git_repo",
                    message: "What is the fsf repo directory? [" + fsf_git_repo + "]",
                    type: 'input',
                    validate: (input) => {
                        if(input.length === 0){
                            return true;
                        }
                        else{
                            if (fs.existsSync(input)) {
                                return true;
                            }
                            else{
                                return "Could not find the repo directory";
                            }
                        }
                    }
                }
            ])
            .then( answers => {
                if(answers.fsf_git_repo.length !== 0){
                    fsf_git_repo = answers.fsf_git_repo;
                    // set global variable
                    this.fsf_git_repo_default = fsf_git_repo;
                }
                this.fsf_git_repo_set = true;
                
                // trying to replicate cd ../lesson-plans && git pull && cd ../class-scripts &&
                shell.cd(fsf_git_repo);
                // put this back after you finish debugging
                if(!this.fsf_git_pull_repo_set){
                    if (shell.exec('git pull').code !== 0) {
                        console.log("Error with git pull");
                    }
                    else{
                        shell.cd(this.basedir);
                        this.fsf_git_pull_repo_set = true;
                        //this.askForLessonPlanDirectory();
                    }
                }
                
                callback(fsf_git_repo);
                
            })
            .catch( error => {
                console.log(error);
            });
        }
        else{
            if(!this.fsf_git_pull_repo_set){
                shell.cd(fsf_git_repo);
                // put this back after you finish debugging
                if (shell.exec('git pull').code !== 0) {
                    console.log("Error with git pull");
                }
                else{
                    shell.cd(this.basedir);
                    this.fsf_git_pull_repo_set = true;
                    callback(fsf_git_repo);
                }
            }
            else{
                callback(fsf_git_repo);
            }
        }
    }

    /**
     * This will ask the user for the location of the class repo folder
     * @param {*} callback This is a callback function
     */
    askForClassRepo(callback){
        let class_repo = this.class_repo_default;
        if(!this.class_repo_set){
            prompt([
                {
                    name: "class_repo",
                    message: "What is the class repo directory? [" + class_repo + "]",
                    type: 'input',
                    validate: (input) => {
                        if(input.length === 0){
                            return true;
                        }
                        else{
                            if (fs.existsSync(input)) {
                                return true;
                            }
                            else{
                                return "Could not find the class repo directory";
                            }
                        }
                    }
                }
            ])
            .then( answers => {
                if(answers.class_repo.length !== 0){
                    class_repo = answers.class_repo;
                    // set global variable
                    this.class_repo_default = class_repo;
                }
                this.class_repo_set = true;
                
                // trying to replicate cd ../lesson-plans && git pull && cd ../class-scripts &&
                shell.cd(class_repo);
                // put this back after you finish debugging
                if(!this.class_pull_repo_set){
                    if (shell.exec('git pull').code !== 0) {
                        console.log("Error with git pull");
                    }
                    else{
                        shell.cd(this.basedir);
                        this.class_pull_repo_set = true;
                        //this.askForLessonPlanDirectory();
                    }
                }
                callback(class_repo);
                
            })
            .catch( error => {
                console.log(error);
            });
        }
        else{
            if(!this.class_pull_repo_set){
                shell.cd(class_repo);
                // put this back after you finish debugging
                if (shell.exec('git pull').code !== 0) {
                    console.log("Error with git pull");
                }
                else{
                    shell.cd(this.basedir);
                    this.class_pull_repo_set = true;
                    callback(class_repo);
                }
            }
            else{
                callback(class_repo);
            }
        }
    }
    /**
     * Asks the user for the lesson plan directory in the full stack repo
     * @param {*} fsf_git_repo This is either the location of full stack repo or the callback
     * @param {*} callback This is a callback function
     */
    askForLessonPlanDirectory(fsf_git_repo, callback){
        if(typeof fsf_git_repo === 'undefined' || fsf_git_repo === null){
            fsf_git_repo = this.fsf_git_repo_default;
        }
        if(typeof fsf_git_repo === 'function'){
            callback = fsf_git_repo;
            fsf_git_repo = this.fsf_git_repo_default;
        }

        let lesson_plan_directory = this.lesson_plan_directory_default;
        if(!this.lesson_plan_directory_set){
            prompt([
                {
                    name: "lesson_plan_directory",
                    message: "What is the lesson plan directory? [" + lesson_plan_directory + "]",
                    type: 'input',
                    validate: (input) => {
                        if(input.length === 0){
                            return true;
                        }
                        else{
                            if (fs.existsSync(fsf_git_repo + "/" + input)) {
                                return true;
                            }
                            else{
                                return "Could not find the directory in the repo";
                            }
                        }
                    }
                }
            ])
            .then( answers => {
                if(answers.lesson_plan_directory.length !== 0){
                    lesson_plan_directory = answers.lesson_plan_directory;
                    this.lesson_plan_directory_default = lesson_plan_directory;
                }
                //this.askForWeek(lesson_plan_directory, this.askForDay.bind(this));
                this.lesson_plan_directory_set = true;
                callback(lesson_plan_directory);
            })
            .catch( error => {
                console.log(error);
            });
        }
        else{
            callback(lesson_plan_directory);
        }
    }
    /**
     * Asks the user for the lesson plan directory in the full stack repo
     * @param {*} fsf_git_repo This is either the location of full stack repo or the callback
     * @param {*} callback This is a callback function
     */
    askForActivityDirectory(fsf_git_repo, callback){
        if(typeof fsf_git_repo === 'undefined' || fsf_git_repo === null){
            fsf_git_repo = this.fsf_git_repo_default;
        }
        if(typeof fsf_git_repo === 'function'){
            callback = fsf_git_repo;
            fsf_git_repo = this.fsf_git_repo_default;
        }

        let activity_directory = this.activity_directory_default;
        if(!this.activity_directory_set){
            prompt([
                {
                    name: "activity_directory",
                    message: "What is the activity directory? [" + activity_directory + "]",
                    type: 'input',
                    validate: (input) => {
                        if(input.length === 0){
                            return true;
                        }
                        else{
                            if (fs.existsSync(fsf_git_repo + "/" + input)) {
                                return true;
                            }
                            else{
                                return "Could not find the directory in the repo";
                            }
                        }
                    }
                }
            ])
            .then( answers => {
                if(answers.activity_directory.length !== 0){
                    activity_directory = answers.activity_directory;
                    this.activity_directory_default = activity_directory;
                }
                //this.askForWeek(lesson_plan_directory, this.askForDay.bind(this));
                this.activity_directory_set = true;
                callback(activity_directory);
            })
            .catch( error => {
                console.log(error);
            });
        }
        else{
            callback(activity_directory);
        }
    }

    /**
     * Generic select a week folder function. This can most like be used to also select a specific folder and drill down
     * @param {*} fsf_git_repo 
     * @param {*} weekly_directory 
     * @param {*} callback 
     * @param {*} message 
     */
    askForWeek(fsf_git_repo, weekly_directory, callback, message){
        if(typeof message === 'undefined'){
            message = "Please select a week: "
        }
        fs.readdir(fsf_git_repo + "/" + weekly_directory, (err, things) => {
            if(err){
                console.log(err);
                return;
            }
            let week_folders = [];
            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(fsf_git_repo + "/" + weekly_directory + "/" + things[i]).isDirectory() === true){
                    week_folders.push(things[i]);
                }
            }
            week_folders.push("Done or Skip");
            // console.log(week_folders);
            prompt([
                {
                    name: 'week',
                    type: 'list',
                    message: message,
                    choices: week_folders
                }
            ])
            .then( answers => {
                // console.log(answers);
                if(answers.week !== "Done or Skip"){
                    callback(answers.week);
                }
                else{
                    callback(false);
                }
                
            })
            .catch( error => {
                console.log(error);
            });
        });
    }
}

module.exports = () => {
    return new HelperGlobal();
};