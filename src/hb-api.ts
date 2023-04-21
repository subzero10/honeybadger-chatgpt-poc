import { HoneybadgerBacktrace, NoticeDetails } from "./types";

function mapBacktraceToStackTrace(className: string, message: string, hbBacktrace: HoneybadgerBacktrace[]) {
    const result = [`${className}: ${message}`];
    for (let backtrace of hbBacktrace) {
        result.push(`    at ${backtrace.method} (${backtrace.file}:${backtrace.number}:${backtrace.column})`);
    }

    return result.join('\n');
}

export async function getNoticeDetails(projectId: number, faultId: number): Promise<NoticeDetails> {
    const faultDetails = require('../src/fault-details.json');
    const noticeDetails = require('../src/notice-details.json');

    return {
        className: faultDetails.klass,
        message: faultDetails.message,
        source: noticeDetails.results[0].backtrace[0].source,
        backtrace: mapBacktraceToStackTrace(faultDetails.klass, faultDetails.message, noticeDetails.results[0].backtrace)
    };
}

// import { NoticeDetails } from "./types";
// import axios from "axios";
//
// const hbAuthToken = process.env.HONEYBADGER_API_AUTH_TOKEN; // your Honeybadger auth token
// const base64HbAuthToken = Buffer.from(`${hbAuthToken}:`).toString("base64"); // base64 encoded Honeybadger auth token
//
// export async function getNoticeDetails(projectId: number, faultId: number): Promise<NoticeDetails> {
//     const resp = await axios.get(`https://api.honeybadger.io/v2/projects/${projectId}/faults/${faultId}`, {
//         auth: {
//             username: hbAuthToken,
//             password: '',
//         }
//     });
//     const { klass, message } = resp.data
//     const resp2 = await axios.get(`https://api.honeybadger.io/v2/projects/${projectId}/faults/${faultId}/notices`, {
//         auth: {
//             username: hbAuthToken,
//             password: '',
//         }
//     });
//     const noticeDetails = resp2.data;
//
//     return {
//         className: klass,
//         message,
//         backtrace: noticeDetails[0].backtrace
//     }
// }
