export type NoticeDetails = {
    className: string;
    message: string;
    backtrace: string;
    source: Record<number, string>;
    breadcrumbs?: unknown[];
}

export type HoneybadgerBacktrace = {
    file: string;
    number: number;
    column: number;
    method: string;
    context: string;
    source?: string;

}

export type ChatGptTextCompletionResponse = {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
            text: string;
            index: number;
            logprobs: Record<string, number>;
            finish_reason: string;
    }[];
}

export type SuggestedFix = {
    actions: {
        explanation?: string;
        operation?: 'InsertAfter' | 'Delete' | 'Replace';
        line?: number;
        content?: string
    }[];
}
