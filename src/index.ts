import { getNoticeDetails } from "./hb-api";
import {askGpt, composePrompt, mapCompletionToFixes} from "./openai-api";
import {createGitStyleDiff} from "./github-api";

async function main() {
    const projectId = process.env.HONEYBADGER_PROJECT_ID;
    const faultId = process.env.HONEYBADGER_FAULT_ID;

    const noticeDetails = await getNoticeDetails(projectId, faultId);
    console.log(noticeDetails);

    // to get anything good from GPT, we need at least stack trace and surrounding source code
    const gptPrompt = composePrompt(noticeDetails);
    console.log(gptPrompt);
    const suggestedFix = await askGpt(gptPrompt);
    if (suggestedFix === null) {
        throw new Error("GPT-3 returned no suggestions");
    }

    const fix = mapCompletionToFixes(suggestedFix);
    const gitStyleDiff = createGitStyleDiff(noticeDetails.source, fix);
    console.log(fix.actions.find((action) => !!action.explanation)?.explanation || 'explanation not found');
    console.log(gitStyleDiff);
}

main().catch((error) => console.error(error));
