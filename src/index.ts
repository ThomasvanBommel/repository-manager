/*
 * File: index.ts
 * Created: Thursday April 1st 2021
 * Author: Thomas vanBommel
 * 
 * Last Modified: Thursday April 1st 2021 3:27pm
 * Modified By: Thomas vanBommel
 * 
 * CHANGELOG:
 */

import express from "express";
import { execSync } from "child_process";
import { headerInspection } from "./github";

const app = express();
const repository = {
    id: 333275051,
    branch: "master"
}

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

    if( github?.isVerified &&
        github.event === "check_suite" &&
        github.targetType === "repository" &&
        github.targetID === repository.id){
            console.log(
                "\n==============================\n",
                new Date().toDateString() + "\n",
                execSync(`git -C ${__dirname}/../repository pull`).toString()
            );
    }
});