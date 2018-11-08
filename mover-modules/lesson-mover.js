const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
// import shell from 'shelljs';
const prompt = inquirer.prompt;


class LessonMover {
    /**
     * This assists in clearing and organizing the daily files
     * @param {*} hg this is the HelperGlobal Object
     */
    constructor(hg){
        this.hg = hg;
        this.daily_lesson = hg.daily_lesson_default;
        this.activity_directory = hg.activity_directory_default;
    }

    
    start(){
        // console.log(this);
        this.askForFsfRepo();
    };
    askForFsfRepo(){
        this.hg.askForFsfRepo((fsf_git_repo) => {
            this.fsf_git_repo = fsf_git_repo;
            this.askForLessonPlanDirectory();
        });
    }

    askForLessonPlanDirectory(){
        this.hg.askForLessonPlanDirectory(this.fsf_git_repo, (lesson_plan_directory) => {
            this.lesson_plan_directory = lesson_plan_directory;
            this.hg.askForWeek(this.fsf_git_repo, this.lesson_plan_directory, this.askForDay.bind(this));
        });
    };

    // askForWeek(weekly_directory, callback, message){
    //     if(typeof message === 'undefined'){
    //         message = "Please select a week: "
    //     }
    //     fs.readdir(this.fsf_git_repo + "/" + weekly_directory, (err, things) => {
    //         if(err){
    //             console.log(err);
    //             return;
    //         }
    //         let week_folders = [];
    //         for(let i = 0; i < things.length; i++){
    //             if(fs.lstatSync(this.fsf_git_repo + "/" + weekly_directory + "/" + things[i]).isDirectory() === true){
    //                 week_folders.push(things[i]);
    //             }
    //         }
    //         week_folders.push("Done or Skip");
    //         // console.log(week_folders);
    //         prompt([
    //             {
    //                 name: 'week',
    //                 type: 'list',
    //                 message: message,
    //                 choices: week_folders
    //             }
    //         ])
    //         .then( answers => {
    //             // console.log(answers);
    //             if(answers.week !== "Done or Skip"){
    //                 callback(answers.week);
    //             }
    //             else{
    //                 callback(false);
    //             }
                
    //         })
    //         .catch( error => {
    //             console.log(error);
    //         });
    //     });
    // }

    askForDay(week_folder){
        if(!week_folder){
            console.log("Exiting");
            return;
        }
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
        this.hg.askForActivityDirectory( (activity_directory) => {
            this.activity_directory = activity_directory;
            this.hg.askForWeek(this.fsf_git_repo, this.activity_directory, this.askForWeekClassActivityFolder.bind(this));
        });
    }
    
    askForWeekClassActivityFolder(week_folder){
        if(!week_folder){
            console.log("Exiting");
            return;
        }
        this.week_activities = this.fsf_git_repo + "/" + this.activity_directory + "/" + week_folder;
        this.hg.askForWeek(this.fsf_git_repo, this.week_activities, this.askForSpecificClassActivities.bind(this), "Please select the class activities folder: ");
        // 
    };
    askForSpecificClassActivities(week_folder){
        if(!week_folder){
            console.log("Exiting");
            return;
        }
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
            //console.log(this.class_activity_folders);
            prompt([
                {
                    name: 'activities_chosen',
                    type: 'checkbox',
                    message: "Please choose all the activities you would like to use: ",
                    choices: this.class_activity_folders
                }
            ])
            .then( answers => {
                this.class_activities_chosen = answers.activities_chosen;
                // console.log(answers);
                // console.log(this);
                this.copySpecificActivities();
            })
            .catch(error =>{
                console.log(error);
            });
        });
    }

    copySpecificActivities(){
        this.daily_lesson_activities = this.daily_lesson + "/" + "activities";
        if (!fs.existsSync(this.daily_lesson_activities)){
            fs.mkdirSync(this.daily_lesson_activities);
        }
        for(let i = 0; i < this.class_activities_chosen.length; i++){
            this.copySpecificActivityToDaily(this.class_activities_chosen[i]);
        }
    }
    copySpecificActivityToDaily(activity_folder){
        let dest = this.daily_lesson_activities + "/" + activity_folder;
        let src = this.week_class_activities + "/" + activity_folder;
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        fsExtra.copy(src, dest, () => {
            console.log("Completed Copy of " + src);
        });
    }
}


module.exports = {
    /**
     * This will start the lesson mover
     * @param {*} hg This is the helper global object
     */
    start(hg){
        let lm = new LessonMover(hg);
        return lm.start();
    }
}