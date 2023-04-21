import {ChatGptTextCompletionResponse, NoticeDetails, SuggestedFix } from "./types";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
});
const OpenAI = new OpenAIApi(configuration);

// prompt heavily based from this
// https://github.com/biobootloader/wolverine/blob/main/prompt.txt
export function composePrompt(context: NoticeDetails): string {
    const { backtrace, source } = context;

    return `
You are part of an elite automated software fixing team. You will be given an extract of a script followed the stacktrace of the error it produced. The structure of the script is a key-value JSON object with the key being the line number and value being the source code of that line in the original source file. Your job is to figure out what went wrong and suggest changes to the code.

Because you are part of an automated system, the format you respond in is very strict. You must provide changes in JSON format, using one of 3 actions: 'Replace', 'Delete', or 'InsertAfter'. 'Delete' will remove that line from the code. 'Replace' will replace the existing line with the content you provide. 'InsertAfter' will insert the new lines you provide after the code already at the specified line number. Make sure that line numbers are correct for each action. The actions need to conform to the line numbers of the script provided. For multi-line insertions or replacements, provide the content as a single string with '\\n' as the newline character. The first line in each file is given line number 1. Edits will be applied in reverse line order so that line numbers won't be impacted by other edits.

In addition to the changes, please also provide short explanations of the what went wrong. A single explanation is required, but if you think it's helpful, feel free to provide more explanations for groups of more complicated changes. Be careful to use proper indentation and spacing in your changes. An example response could be:

Be ABSOLUTELY SURE to include the CORRECT INDENTATION when making replacements.

The script you are fixing is: ${JSON.stringify(source, null, 4)}

The stacktrace of the error is: ${backtrace}

example response:
[
  {"explanation": "this is just an example, this would usually be a brief explanation of what went wrong"},
  {"operation": "InsertAfter", "line": 10, "content": "x = 1\\ny = 2\\nz = x * y"},
  {"operation": "Delete", "line": 15, "content": ""},
  {"operation": "Replace", "line": 18, "content": "        x += 1"},
  {"operation": "Delete", "line": 20, "content": ""}
]

Finally, the response MUST be in JSON.
`;
}

export async function askGpt(prompt: string): Promise<ChatGptTextCompletionResponse | null> {
    try {
        const response = await OpenAI.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0,
            max_tokens: 500,
        });

        return response.data as ChatGptTextCompletionResponse
    }
    catch (e: any) {
        if (e.response?.data?.error) {
            throw new Error(e.response.data.error);
        }
        throw e;
    }
}

export function mapCompletionToFixes(completion: ChatGptTextCompletionResponse): SuggestedFix {
    const rawStr = completion.choices[0].text.trim();
    const parts = rawStr.split('\n');
    const rawJson = [];
    let foundJson = false;
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].trim();
        if (parts[i].startsWith('[')) {
            foundJson = true;
        }

        if (foundJson) {
            rawJson.push(parts[i]);
        }
    }

    const jsonStr = rawJson.join('\n');
    try {
        const actions = JSON.parse(jsonStr);

        return { actions };
    }
    catch (e) {
        throw new Error(`Invalid JSON in response: ${jsonStr}`);
    }
}
