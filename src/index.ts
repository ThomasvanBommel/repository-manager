/*
 * File: index.ts
 * Created: Thursday April 1st 2021
 * Author: Thomas vanBommel
 * 
 * Last Modified: Friday April 2nd 2021 12:04pm
 * Modified By: Thomas vanBommel
 * 
 * CHANGELOG:
 */

import express from "express";
import { exec } from "child_process";
import { headerInspection } from "./github";

const app = express();
const repository = {
    id: 333275051,
    branch: "master"
};

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Github validation middleware
app.use(headerInspection);

// Set headers
app.use((req, res, next) => {
    res.set("X-Powered-By", "Sagittarius A*");
    next();
});

// Respond to all endpoints
app.all("*", (req, res) => {
    // Ignore favicon requests
    if(req.url === "/favicon.ico") return;
    
    const github = req.github;
    const body = req.body;
    let conclusion: string = "failure";
    let branch: string = "not-master";

    if("check_suite" in body){
        if("conclusion" in body.check_suite)
            conclusion = body.check_suite.conclusion;

        if("head_branch" in body.check_suite)
            branch = body.check_suite.head_branch;
    }

    if( branch === repository.branch &&
        conclusion === "success" &&
        github?.isVerified &&
        github.event === "check_suite" &&
        github.targetType === "repository" &&
        github.targetID === repository.id){
            // Update repository touch file
            exec(`touch ${__dirname}/../repository/update.touch`);

            // Send thank you
            res.send("👍 Thank you!");
    }else{
        // Tell them we're not interested
        res.send("⛔ No thanks!");
    }
});

app.listen(8080, () => console.log("Listening..."));