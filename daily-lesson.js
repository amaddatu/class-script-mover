const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const prompt = inquirer.prompt;
const shell = require('shelljs');
let fsf_git_repo_default = "../lesson-plans";//directory of the fsf git repository
let lesson_plan_directory_default = "02-lesson-plans/part-time";
let daily_lesson_default = "../daily"; //this is the default daily directory - please remember that this directory will be deleted first if chosen


//go to the current directory of the script
shell.cd(__dirname);

// fs.readdir(fsf_git_repo + "/" + lesson_plan_directory, function(err, items) {
//     if(err){
//         console.log(err);
//         return;
//     }
//     console.log(items);

//     for (var i=0; i<items.length; i++) {
//         console.log(items[i]);
//     }
// });

const askForFsfRepo = (fsf_git_repo, lesson_plan_directory) => {
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
        }
        
        // trying to replicate cd ../lesson-plans && git pull && cd ../class-scripts &&
        shell.cd(fsf_git_repo);
        if (shell.exec('git pull').code !== 0) {
            console.log("Error with git pull");
        }
        else{
            shell.cd(__dirname);
            askForLessonPlanDirectory(fsf_git_repo, lesson_plan_directory);
        }
        
    })
    .catch( error => {
        console.log(error);
    });
}
const askForLessonPlanDirectory = (fsf_git_repo, lesson_plan_directory) => {
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
        }
        askForWeek(fsf_git_repo, lesson_plan_directory);
    })
    .catch( error => {
        console.log(error);
    });
};

const askForWeek = (fsf_git_repo, lesson_plan_directory) => {
    fs.readdir(fsf_git_repo + "/" + lesson_plan_directory, (err, things) => {
        if(err){
            console.log(err);
            return;
        }
        let week_folders = [];
        for(let i = 0; i < things.length; i++){
            if(fs.lstatSync(fsf_git_repo + "/" + lesson_plan_directory + "/" + things[i]).isDirectory() === true){
                week_folders.push(things[i]);
            }
        }
        // console.log(week_folders);
        prompt([
            {
                name: 'week',
                type: 'list',
                message: "Please select a week: ",
                choices: week_folders
            }
        ])
        .then( answers => {
            // console.log(answers);
            askForDay(fsf_git_repo, lesson_plan_directory, answers.week);
        })
        .catch( error => {
            console.log(error);
        });
    });
}
const askForDay = (fsf_git_repo, lesson_plan_directory, week_folder) => {
    let week = fsf_git_repo + "/" + lesson_plan_directory + "/" + week_folder;
    fs.readdir(week, (err, things) => {
        if(err){
            console.log(err);
            return;
        }

        let day_folders = [];
        for(let i = 0; i < things.length; i++){
            if(fs.lstatSync(week + "/" + things[i]).isDirectory() === true){
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
            let day = week + "/" + answers.day;
            // console.log({
            //     day: day
            // })
            askForDailyFolder(week, day);
        })
        .catch( error => {
            console.log(error);
        });
    });
}

const askForDailyFolder = (week_path, day_path) => {
    let daily_folder = daily_lesson_default;
    prompt([
        {
            name: "daily_folder",
            message: "What is the daily directory (will be deleted) ? [" + daily_folder + "]",
            type: 'input'
        }
    ])
    .then( answers => {
        if(answers.daily_folder.length !== 0){
            daily_folder = answers.daily_folder;
        }
        if (!fs.existsSync(daily_folder)){
            fs.mkdirSync(daily_folder);
            copyToDaily(week_path, day_path, daily_folder);
        }
        else{
            confirmDailyFolderDeletion(week_path, day_path, daily_folder);
        }
    })
    .catch( error => {
        console.log(error);
    });
}

const confirmDailyFolderDeletion = (week_path, day_path, daily_path) => {
    fs.readdir(daily_path, (err, things) => {
        if(err){
            console.log(err);
            return;
        }
        if(things.length > 0){
            console.log("----------");
            console.log("These files/folders will be deleted in the daily folder: ");
            console.log("-----");
            for(let i = 0; i < things.length; i++){
                if(fs.lstatSync(path.join(daily_path, things[i])).isFile()){
                    console.log("f:  " + things[i]);
                }
                else if(fs.lstatSync(path.join(daily_path, things[i])).isDirectory()){
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
                    clearDaily(week_path, day_path, daily_path);
                }
                else{
                    askForDailyFolder(week_path, day_path);
                }
            })
            .catch( error => {
                console.log(error);
            });
        }
        else{
            copyToDaily(week_path, day_path, daily_path);
        }
        
    });
};

const clearDaily = (week_path, day_path, daily_path) => {
    fs.readdir(daily_path, (err, files) => {
        if (err) throw err;
        
        let files_processed = 0;
        let files_to_process = files.length;
        for (const file of files) {
            if(fs.lstatSync(path.join(daily_path, file)).isFile()){
                fs.unlink(path.join(daily_path, file), err => {
                    if (err) throw err;
                    files_processed++;
                    if(files_processed >= files_to_process){
                        copyToDaily(week_path, day_path, daily_path);
                    }
                });
            }
            else if(fs.lstatSync(path.join(daily_path, file)).isDirectory()){
                fsExtra.remove(path.join(daily_path, file))
                .then( () => {
                    files_processed++;
                    if(files_processed >= files_to_process){
                        copyToDaily(week_path, day_path, daily_path);
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
// const clearSubDirectory = (sub_path, callback) => {
//     fs.readdir(sub_path, (err, files) => {
//         if (err) throw err;
        
//         let files_processed = 0;
//         let files_to_process = files.length;
//         for (const file of files) {
//             if(fs.lstatSync(path.join(sub_path, file)).isFile()){
//                 fs.unlink(path.join(sub_path, file), err => {
//                     files_processed++;
//                     if(files_processed >= files_to_process){
//                         callback();
//                     }
//                 });
//             }
//             else if(fs.lstatSync(path.join(sub_path, file)).isDirectory()){
//                 clearSubDirectory(path.join(sub_path, file), () => {
//                     files_processed++;
//                     if(files_processed >= files_to_process){
//                         callback();
//                     }
//                 });
//             }
//         }
//     });
// }
const copyToDaily = (week_path, day_path, daily_path) => {
    // console.log("copyToDaily");
    fs.readdir(week_path, (err, things) => {
        if(err){
            console.log(err);
            return;
        }

        for(let i = 0; i < things.length; i++){
            if(fs.lstatSync(path.join(week_path, things[i])).isFile()){
                fsExtra.copySync(path.join(week_path, things[i]), path.join(daily_path, things[i]));
            }
        }
    });
    let day_folder = path.basename(day_path);
    let daily_day_path = path.join(daily_path, day_folder)
    if (!fs.existsSync(daily_day_path)){
        fs.mkdirSync(daily_day_path);
        fsExtra.copySync(day_path, daily_day_path);
        console.log("Completed Copy");
    }
};
askForFsfRepo(fsf_git_repo_default, lesson_plan_directory_default);