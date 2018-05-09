import axios from 'axios';
import Promise from 'bluebird';
import moment from 'moment';

import { stringCheck, arrayCheck, errorBuild } from './helper';
import { DAILYMOTION_REGEX } from './constants';


const errBuild = (func, msg) => errBuild("Dailymotion", func, msg);

/**
 * @description Builds request uri for api call
 * @param {String} link 
 */
function buildRequest(link) {
    const parsed = DAILYMOTION_REGEX.exec(link);
    if (parsed)
        return `https://api.dailymotion.com/video/${parsed[2]}` +
            `?fields=channel,created_time,duration,height,thumbnail_url,title,url,width,`;
    else
        throw "Failed to parse link"
}


function parseVideoData(raw_data) {
    const { title, url, duration, created_time,
        width, height, thumbnail_url } = raw_data;

    return {
        title,
        duration: moment.duration(duration, "s").toISOString(),
        link: url,
        createdTime: moment.unix(created_time).toISOString(),
        dimensions: width + ' x ' + height,
        thumbnail: thumbnail_url
    }
}

async function videoInfoData(link) {
    try {
        const url = buildRequest(link);
        const result = (await axios.get(url)).data;
        return parseVideoData(result);
    } catch (error) { throw error }
}

function multiVideoData(links) {

    const promiseArray = links.map(link =>
        new Promise(async (resolve, reject) => {
            videoInfoData(link)
                .then(result => resolve(result))
                .catch(error => reject({ error, link }));
        })
    );

    return Promise.all(promiseArray.map(p => p.reflect()))
        .then(values => [
            values.filter(x => x.isFulfilled()).map(x => x.value()),
            values.filter(x => x.isRejected()).map(x => x.reason())
        ]).then(arr => [].concat.apply([], arr));
}

export default {
    /**
     * @description Takes dailymotion link, returns parsed video info
     * @param {[String]|String} links
     * @returns {Promise} parsed data
     */
    async videoData(...links) {
        const funcName = "videoData"

        if ((links.length == 0) ||
            (arrayCheck(links[0]) && (links[0].length == 0)))
            throw errBuild(funcName, `Empty`);

        try {

            if (stringCheck(links[0]))
                return (links.length == 1)
                    ? videoInfoData(links[0])
                    : multiVideoData(links);

            if (arrayCheck(links[0]) && stringCheck(links[0][0]))
                return (links[0].length == 1)
                    ? videoInfoData(links[0][0])
                    : multiVideoData(links[0]);

        } catch (error) { throw errBuild(funcName, error) }

        throw errBuild(funcName, `Invalid param type, String(s) expected`);
    }
}