const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const prompt = inquirer.prompt;
const shell = require('shelljs');
let fsf_git_repo_default = "../lesson-plans";//directory of the fsf git repository
let lesson_plan_directory_default = "02-lesson-plans/part-time";
let daily_lesson_default = "../daily"; //this is the default daily directory - please remember that this directory will be deleted first if chosen
let activity_directory_default = "01-Class-Content";

//go to the current directory of the script
shell.cd(__dirname);

class LessonMover {
    constructor(fsf_git_repo_default, lesson_plan_directory_default, daily_lesson_default, activity_directory_default){
        this.fsf_git_repo = fsf_git_repo_default;
        this.lesson_plan_directory = lesson_plan_directory_default;
        this.daily_lesson = daily_lesson_default;
        this.activity_directory = activity_directory_default;
    }

    
    start(){
        // console.log(this);
        this.askForFsfRepo();
    };
    askForFsfRepo(){
        prompt([
            {
                name: "fsf_git_repo",
                message: "What is the fsf repo directory? [" + this.fsf_git_repo + "]",
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
                this.fsf_git_repo = answers.fsf_git_repo;
            }
            
            // trying to replicate cd ../lesson-plans && git pull && cd ../class-scripts &&
            shell.cd(this.fsf_git_repo);
            // // put this back after you finish debugging
            // if (shell.exec('git pull').code !== 0) {
            //     console.log("Error with git pull");
            // }
            // else{
                shell.cd(__dirname);
                this.askForLessonPlanDirectory();
            // }
            
        })
        .catch( error => {
            console.log(error);
        });
    }

    askForLessonPlanDirectory(){
        prompt([
            {
                name: "lesson_plan_directory",
                message: "What is the lesson plan directory? [" + this.lesson_plan_directory + "]",
                type: 'input',
                validate: (input) => {
                    if(input.length === 0){
                        return true;
                    }
                    else{
                        if (fs.existsSync(this.fsf_git_repo + "/" + input)) {
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
                this.lesson_plan_directory = answers.lesson_plan_directory;
            }
            this.askForWeek(this.lesson_plan_directory, this.askForDay.bind(this));
        })
        .catch( error => {
            console.log(error);
        });
    };

    askForWeek(weekly_directory, callback, message){
        if(typeof message === 'undefined'){
            message = "Please select a week: "
        }
        fs.readdir(this.fsf_git_repo + "/" + weekly_directory, (err, things) => {
            if(err){
                console.log(err);
                return;
            }
            let week_folders = [];
            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(this.fsf_git_repo + "/" + weekly_directory + "/" + things[i]).isDirectory() === true){
                    week_folders.push(things[i]);
                }
            }
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
                callback(answers.week);
            })
            .catch( error => {
                console.log(error);
            });
        });
    }

    askForDay(week_folder){
        this.week = this.fsf_git_repo + "/" + this.lesson_plan_directory + "/" + week_folder;
        fs.readdir(this.week, (err, things) => {
            if(err){
                console.log(err);
                return;
            }
    
            let day_folders = [];
            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(this.week + "/" + things[i]).isDirectory() === true){
                    day_folders.push(things[i]);
                }
            }
            prompt([
                {
                    name: 'day',
                    type: 'list',
                    message: "Please select a day: ",
                    choices: day_folders
                }
            ])
            .then( answers => {
                this.day = this.week + "/" + answers.day;
                // console.log({
                //     day: day
                // })
                this.askForDailyFolder();
            })
            .catch( error => {
                console.log(error);
            });
        });
    }
    

    askForDailyFolder(){
        prompt([
            {
                name: "daily_folder",
                message: "What is the daily directory (will be deleted) ? [" + this.daily_lesson + "]",
                type: 'input'
            }
        ])
        .then( answers => {
            if(answers.daily_folder.length !== 0){
                this.daily_lesson = answers.daily_folder;
            }
            if (!fs.existsSync(this.daily_lesson)){
                fs.mkdirSync(this.daily_lesson);
                //copyToDaily(this.week, this.day, this.daily_lesson);
                this.copyToDaily();
            }
            else{
                this.confirmDailyFolderDeletion();
            }
        })
        .catch( error => {
            console.log(error);
        });
    }

    confirmDailyFolderDeletion(){
        fs.readdir(this.daily_lesson, (err, things) => {
            if(err){
                console.log(err);
                return;
            }
            if(things.length > 0){
                console.log("----------");
                console.log("These files/folders will be deleted in the daily folder: ");
                console.log("-----");
                for(let i = 0; i < things.length; i++){
                    if(fs.lstatSync(path.join(this.daily_lesson, things[i])).isFile()){
                        console.log("f:  " + things[i]);
                    }
                    else if(fs.lstatSync(path.join(this.daily_lesson, things[i])).isDirectory()){
                        console.log("d:  " + things[i]);
                    }
                    
                }
                console.log("-----");
                prompt([
                    {
                        name: 'daily_deletion',
                        message: "Confirm Deletion: ",
                        type: 'confirm'
                    }
                ])
                .then( answers => {
                    if(answers.daily_deletion){
                        this.clearDaily();
                    }
                    else{
                        this.askForDailyFolder();
                    }
                })
                .catch( error => {
                    console.log(error);
                });
            }
            else{
                //copyToDaily(week_path, day_path, daily_path);
            }
            
        });
    };

    clearDaily(){
        fs.readdir(this.daily_lesson, (err, files) => {
            if (err) throw err;
            
            let files_processed = 0;
            let files_to_process = files.length;
            for (const file of files) {
                if(fs.lstatSync(path.join(this.daily_lesson, file)).isFile()){
                    fs.unlink(path.join(this.daily_lesson, file), err => {
                        if (err) throw err;
                        files_processed++;
                        if(files_processed >= files_to_process){
                            this.copyToDaily();
                        }
                    });
                }
                else if(fs.lstatSync(path.join(this.daily_lesson, file)).isDirectory()){
                    fsExtra.remove(path.join(this.daily_lesson, file))
                    .then( () => {
                        files_processed++;
                        if(files_processed >= files_to_process){
                            this.copyToDaily();
                        }
                    })
                    .catch( error => {
                        console.log(error);
                    })
                    ;
                }
            }
        });
    };


    copyToDaily(){
        // console.log("copyToDaily");
        fs.readdir(this.week, (err, things) => {
            if(err){
                console.log(err);
                return;
            }

            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(path.join(this.week, things[i])).isFile()){
                    fsExtra.copySync(path.join(this.week, things[i]), path.join(this.daily_lesson, things[i]));
                }
            }
        });
        let day_folder = path.basename(this.day);
        let daily_day_path = path.join(this.daily_lesson, day_folder)
        if (!fs.existsSync(daily_day_path)){
            fs.mkdirSync(daily_day_path);
            fsExtra.copySync(this.day, daily_day_path);
            console.log("Completed Copy");
        }

        this.askForActivityDirectory();
    };


    askForActivityDirectory(){
        prompt([
            {
                name: "activity_directory",
                message: "What is the activity directory? [" + this.activity_directory + "]",
                type: 'input',
                validate: (input) => {
                    if(input.length === 0){
                        return true;
                    }
                    else{
                        if (fs.existsSync(this.fsf_git_repo + "/" + input)) {
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
                this.activity_directory = answers.activity_directory;
            }
            console.log(this.activity_directory);
            this.askForWeek(this.activity_directory, this.askForWeekClassActivityFolder.bind(this));
        })
        .catch( error => {
            console.log(error);
        });
    }
    
    askForWeekClassActivityFolder(week_folder){
        this.week_activities = this.fsf_git_repo + "/" + this.activity_directory + "/" + week_folder;
        this.askForWeek(this.week_activities, this.askForSpecificClassActivities.bind(this), "Please select the class activities folder: ");
        // 
    };
    askForSpecificClassActivities(week_folder){
        this.week_class_activities = this.week_activities + "/" + week_folder;
        fs.readdir(this.week_class_activities, (err, things) => {
            if(err){
                console.log(err);
                return;
            }
    
            this.class_activity_folders = [];
            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(this.week_class_activities + "/" + things[i]).isDirectory() === true){
                    this.class_activity_folders.push(things[i]);
                }
            }
            console.log(this.class_activity_folders);
            
        });
    }
}

let lm = new LessonMover(fsf_git_repo_default, lesson_plan_directory_default, daily_lesson_default, activity_directory_default);
lm.start();


//askForFsfRepo(fsf_git_repo_default, lesson_plan_directory_default);
//askForActivityDirectory(fsf_git_repo_default, activity_directory_default);