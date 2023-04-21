import { Octokit } from "@octokit/rest";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import { SuggestedFix } from "./types";

export function createGitStyleDiff(sourceCode: Record<number, string>, fix: SuggestedFix): string {
    const result = [];
    for (let action of fix.actions) {
        for (let lineNumber in sourceCode) {
            const code = sourceCode[lineNumber];
            if (action.line === +lineNumber) {
                if (action.operation === "InsertAfter") {
                    result.push(`${lineNumber} +${action.content}`);
                } else if (action.operation === "Delete") {
                    result.push(`${lineNumber} -${code}`);
                } else if (action.operation === "Replace") {
                    result.push(`${lineNumber} -${code}`);
                    result.push(`${lineNumber} +${action.content}`);
                }
            }
        }
    }

    return result.join("\n");
}

// unfinished - ignore
export async function createPr() {
    const modifiedCode = "..."; // your modified code
    const modifiedCodeStartingLineNumber = 42; // line number where modified code starts
    const sourceCodeFilePath = "/path/to/source/code"; // path to the file containing the source code
    const repository = "username/repo"; // the name of the GitHub repository to modify
    const branch = "main"; // the branch to modify
    const token = "your-github-token"; // personal access token with repo access

    // Checkout the GitHub repository and branch using the GitHub personal access token.
    const octokit = new Octokit({ auth: token });
    const { data: { clone_url } } = await octokit.repos.get({ owner: repository.split("/")[0], repo: repository.split("/")[1] });
    const repoDir = path.join(process.cwd(), "repo");
    execSync(`git clone ${clone_url} ${repoDir}`);
    execSync(`cd ${repoDir} && git checkout ${branch}`);

    // Apply the modifiedCode from the modifiedCodeStartingLineNumber in the file located at sourceCodeFilePath.
    const sourceCodeFileFullPath = path.join(repoDir, sourceCodeFilePath);
    const sourceCode = fs.readFileSync(sourceCodeFileFullPath, { encoding: "utf8" });
    const sourceCodeLines = sourceCode.split(/\r?\n/);
    sourceCodeLines.splice(modifiedCodeStartingLineNumber - 1, 0, modifiedCode);
    fs.writeFileSync(sourceCodeFileFullPath, sourceCodeLines.join("\n"));

    // Create a Pull Request with title “Anything else?” and description “I did your job. Now get me a latte”.
    const title = "Anything else?";
    const body = "I did your job. Now get me a latte.";
    const { data: { html_url } } = await octokit.pulls.create({
        owner: repository.split("/")[0],
        repo: repository.split("/")[1],
        title,
        body,
        head: `your-username:${branch}`,
        base: branch
    });

    console.log(`Pull request created at ${html_url}`);

    // Remove the checked out folder after the pull request is created.
    execSync(`rm -rf ${repoDir}`);
}
