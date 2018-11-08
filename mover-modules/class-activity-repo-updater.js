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
        this.askForClassRepoDirectory();
    }

    askForGitRepo(){
        this.hg.askForFsfRepo( fsf_git_repo => {
            this.fsf_git_repo = fsf_git_repo;
            this.askForActivityDirectory();
        });
    }
    
    askForActivityDirectory(){
        this.hg.askForActivityDirectory( activity_directory => {
            this.activity_directory = activity_directory;
            
            this.hg.askForWeek(this.fsf_git_repo, this.activity_directory, this.askForWeekClassActivityFolder.bind(this));
        });
    }

    askForWeekClassActivityFolder(week_folder){
        if(!week_folder){
            console.log("Exiting");
            return;
        }
        this.current_week = week_folder;
        this.week_activities = this.fsf_git_repo + "/" + this.activity_directory + "/" + week_folder;
        this.hg.askForWeek(this.fsf_git_repo, this.week_activities, this.askForSpecificClassActivities.bind(this), "Please select the class activities folder: ");
        // 
    };

    askForSpecificClassActivities(week_folder){
        if(!week_folder){
            console.log("Exiting");
            return;
        }
        this.current_week_inner = week_folder;
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
                // this.next();
            })
            .catch(error =>{
                console.log(error);
            });
        });
    }
    copySpecificActivities(){
        this.class_content_activity_parent = path.join( this.class_repo, this.class_repo_content, this.current_week, this.current_week_inner);
        if (!fs.existsSync(this.class_content_activity_parent)){
            fs.mkdirSync(this.class_content_activity_parent);
        }
        for(let i = 0; i < this.class_activities_chosen.length; i++){
            this.copySpecificActivityToDaily(this.class_activities_chosen[i]);
        }
        this.next();
    }
    copySpecificActivityToDaily(activity_folder){
        let dest = path.join(this.class_content_activity_parent, activity_folder);
        let src = path.join(this.week_class_activities, activity_folder);
        // console.log("Will try to copy " + src + " to " + dest);
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        fsExtra.copy(src, dest, () => {
            console.log("Completed Copy of " + src);
        });
    }

    

    askForClassRepoDirectory(){
        this.hg.askForClassRepo( class_repo => {
            this.class_repo = class_repo;
            this.askForClassRepoActivityDirectory();
        });
    }

    
    askForClassRepoActivityDirectory(){
        // this.hg.askForClassRepo( class_repo => {
        //     this.class_repo = class_repo;
        //     this.askForGitRepo();
        // });
        this.hg.askForClassRepoContentDirectory( class_repo_content => {
            this.class_repo_content = class_repo_content;
            this.askForGitRepo();
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