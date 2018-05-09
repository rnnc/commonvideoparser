import axios from 'axios';
import Promise from 'bluebird';
import moment from 'moment';

import { getGoogleApiKey, setGoogleApiKey } from './config'
import { stringCheck, arrayCheck, errorBuild } from './helper';
import { GOOGLEDRIVE_REGEX } from './constants';


const errBuild = (func, msg) => errorBuild("Google Drive", func, msg);

function buildRequest(link) {

    const parsed = GOOGLEDRIVE_REGEX.exec(link);
    if (parsed)
        return `https://www.googleapis.com/drive/v3/files/${parsed[1]}` +
            `?fields=createdTime%2Cid%2Cname%2Csize%2CthumbnailLink%2CvideoMediaMetadata%2CwebViewLink` +
            `&key=${getGoogleApiKey()}`;
    else throw "Failed to parse link";
}


/** 
 * @description Takes API data and parses into more something useful for front end
 * @param {Object} raw_data GDrive API Raw Data
 * @returns {Object} parsed data for front end
 */
function parseVideoData(raw_data) {
    const { name, webViewLink, size, createdTime,
        videoMediaMetadata, thumbnailLink } = (raw_data);

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

async function videoInfoData(link) {
    try {
        const url = buildRequest(link);
        const result = (await axios.get(url)).data;
        return parseVideoData(result);
    } catch (error) { throw error }
}

function multiVideoInfoData(links) {

    const promiseArray = links.map(link =>
        new Promise(async (resolve, reject) => {
            try {
                const url = buildRequest(link);
                const result = (await axios.get(url)).data;
                resolve(parseVideoData(result));
            } catch (error) { reject({ error, link }) }
        })
    );

    return Promise.all(promiseArray.map(p => p.reflect()))
        .then(values => [
            values.filter(x => x.isFulfilled()).map(x => x.value()),
            values.filter(x => x.isRejected()).map(x => x.reason())
        ]).then(arr => [].concat.apply([], arr));
}


export default {

    setGoogleApiKey,

    /** 
     * @description Gets GDrive file info
     * @param {[String]|String} links Google Drive URL link, or array of links
     * @return {Promise} returns err or data
     */
    async videoData(...links) {
        const funcName = "videoData";

        if (!getGoogleApiKey())
            throw errBuild(funcName,
                `Google Api Key not set, use 'setGoogleApiKey'`);

        if ((links.length == 0) ||
            (arrayCheck(links[0]) && (links[0].length == 0)))
            throw errBuild(funcName, `Empty`);

        try {

            if (stringCheck(links[0]))
                return (links.length == 1)
                    ? videoInfoData(links[0])
                    : multiVideoInfoData(links);

            if (arrayCheck(links[0]) && stringCheck(links[0][0]))
                return (links[0].length == 1)
                    ? videoInfoData(links[0][0])
                    : multiVideoInfoData(links[0]);

        } catch (error) { throw errBuild(funcName, error) }

        throw errBuild(funcName, `Invalid param type, String(s) expected`);
    }
}