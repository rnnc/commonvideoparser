import rp from 'request-promise';
import moment from 'moment';

import { parsingRegex } from './config';
import { stringCheck, errorBuild } from './helper';

const errBuild = (func, msg) => errBuild("Dailymotion", func, msg);

const url_regex = parsingRegex("dailymotion");

/**
 * @description Builds request uri for api call
 * @param {String} link 
 */
function buildRequest(link) {
    const parsed = url_regex.exec(link);
    if (parsed)
        return `https://api.dailymotion.com/video/${parsed[2]}` +
            `?fields=channel,created_time,duration,height,thumbnail_url,title,url,width,`;

    throw errBuild(null, "Invalid Link (Error in Parsing)")
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

export default {
    /**
     * @description Takes dailymotion link, returns parsed video info
     * @param {[String]|String} links
     * @returns {Promise} parsed data
     */
    async videoData(links) {

        if (Array.isArray(links)) {

            let resultArray = [];

            for (const url of links) {
                try {
                    const b_uri = buildRequest(url);
                    const result = JSON.parse(await rp.get(b_uri));
                    resultArray.push(parseVideoData(result));
                } catch (error) { resultArray.push({ error, video: url }) }
            }

            return resultArray;
        }

        if (stringCheck(links)) {

            const uri = buildRequest(links);
            return parseVideoData(JSON.parse(await rp.get(uri)));
        }

        throw errBuild("videoData",
            `Invalid param type, String or String[] expected; got ${typeof links} instead`);
    }
}