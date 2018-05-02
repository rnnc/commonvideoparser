import rp from 'request-promise';
import moment from 'moment';

import { getGoogleApiKey, setGoogleApiKey, parsingRegex } from './config'
import { stringCheck, errorBuild } from './helper';

const errBuild = (func, msg) => errorBuild("Google Drive", func, msg);

const url_regex = parsingRegex("gdrive");

function buildRequest(link) {

    const parsed = url_regex.exec(link);

    if (parsed)
        return `https://www.googleapis.com/drive/v3/files/${parsed[1]}` +
            `?fields=createdTime%2Cid%2Cname%2Csize%2CthumbnailLink%2CvideoMediaMetadata%2CwebViewLink` +
            `&key=` + getGoogleApiKey();

    else throw errBuild(null, "Invalid link (Error in Parsing)");
}


/** 
 * @description Takes API data and parses into more something useful for front end
 * @param {Object} raw_data GDrive API Raw Data
 * @returns {Object} parsed data for front end
 */
function parseVideoData(raw_data) {
    const { name, webViewLink, size, createdTime,
        videoMediaMetadata, thumbnailLink } = JSON.parse(raw_data);

    try {
        return {
            title: name,
            duration: moment.duration(Number(videoMediaMetadata.durationMillis), "ms").toISOString(),
            link: webViewLink.match(/(.*)(\/view)/i)[1],
            size: `${(size / 1000000).toFixed(2)} MB`,
            createdTime,
            dimensions: `${videoMediaMetadata.width} x ${videoMediaMetadata.height}`,
            thumbnail: thumbnailLink,
        }
    } catch (e) { throw e }
}


export default {

    setGoogleApiKey,

    /** 
     * @description Gets GDrive file info
     * @param {[String]|String} links Google Drive URL link, or array of links
     * @return {Promise} returns err or data
     */
    async videoData(links) {
        const funcName = "videoData";

        if (!getGoogleApiKey())
            throw `Google Api Key not set, use 'setGoogleApiKey'`;

        if (Array.isArray(links)) {
            let resultArray = [];
            for (const url of links) {
                try {
                    const b_uri = buildRequest(url);
                    resultArray.push(parseVideoData(await rp.get(b_uri)));
                } catch (error) { resultArray.push({ error, video: url }) };
            }
            return resultArray;
        }

        if (stringCheck(links)) {
            const url = buildRequest(links);
            return parseVideoData(await rp.get(url));
        }

        throw errBuild(funcName,
            `Invalid param type, String or String[] expected; got ${typeof links} instead`);
    }
}