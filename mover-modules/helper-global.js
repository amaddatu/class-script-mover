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
        this.fsf_git_repo_set = false;
        this.fsf_git_pull_repo_set = false;
        this.lesson_plan_directory_set = false;
        this.basedir = path.dirname(__dirname); //since we are in a sub-folder, we must use this to get the parent directory
    }
    

    askForFsfRepo(fsf_git_repo, callback){
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
                if (shell.exec('git pull').code !== 0) {
                    console.log("Error with git pull");
                }
                else{
                    shell.cd(this.basedir);
                    this.fsf_git_pull_repo_set = true;
                    //this.askForLessonPlanDirectory();
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
    askForLessonPlanDirectory(fsf_git_repo, lesson_plan_directory, callback){
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
}

module.exports = () => {
    return new HelperGlobal();
};