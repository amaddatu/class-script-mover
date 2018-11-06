const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const prompt = inquirer.prompt;
let fsf_git_repo_default = "../lesson-plans";//directory of the fsf git repository
let lesson_plan_directory_default = "02-lesson-plans/part-time";

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
        askForLessonPlanDirectory(fsf_git_repo, lesson_plan_directory);
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
    fs.readdir(fsf_git_repo + "/" + lesson_plan_directory, (err, week_folders) => {
        if(err){
            console.log(err);
            return;
        }
        
        console.log(week_folders);
    });
}
const askForDay = (fsf_git_repo, lesson_plan_directory, week_folder) => {

}

askForFsfRepo(fsf_git_repo_default, lesson_plan_directory_default);