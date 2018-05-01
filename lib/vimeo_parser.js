import moment from 'moment';
import { Vimeo } from 'vimeo';

import { getVimeoApiConfig, setVimeoApiConfig, parsingRegex } from './config';
import { stringCheck, errorBuild } from './helper';

const errBuild = (func, msg) => errorBuild("Vimeo", func, msg);

const url_regex = parsingRegex("vimeo");

const API_CHECK = (funcName) => {
    if (!getVimeoApiConfig())
        throw errBuild(funcName, `Vimeo Api Config not set, use 'setVimeoApiConfig'`);
    return true;
}

const vimeoApi = () => {
    const { CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN } = getVimeoApiConfig();
    return new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);
}


/** 
 * @description takes vimeo link and extracts ID
 * @param {String} link 
 * @returns {String} returns video id
 */
function parseVideoId(link) {
    const parsed = url_regex.exec(link);
    if (parsed) return parsed[1];
    throw errBuild(this.constructor.name, "Failed to parse link")
}


/** 
 * @description gets vimeo video info and parses to db format
 * @param {String} link 
 * @returns {Promise}
 */
function videoRequest(link) {
    return new Promise((resolve, reject) => {
        vimeoApi().request({ path: `videos/${parseVideoId(link)}` },
            (error, body) => {
                (error)
                    ? reject(JSON.parse(error.message).error)
                    : resolve(parseVideoInfo(body));
            })
    })
}


/** 
 * @description parses raw api data 
 * @param {Object} data video data from API
 * @returns {Object} returns object of parsed video data
 */
function parseVideoInfo(raw_data) {

    const { user, name, uri, duration, width, height,
        created_time, release_time } = raw_data;

    return {
        name,
        link: raw_data.link,
        duration: moment.duration(duration, "s").toISOString(), //duration is in secs
        description: raw_data.description,
        user: user.name,
        user_link: user.link,
        created_time,
        release_time,
        dimensions: `${width} x ${height}`,
        thumbnail: raw_data.pictures.sizes.pop().link.replace('?r=pad', '')
    }
}


export default {

    setVimeoApiConfig,

    /** 
     * @description takes single or array of vimeo links & gets info
     * returns array of results that have parsed video info
     * or error with video link
     * @param {String|[String]} links
     * @returns {Promise<"parsedData"|["parsedData"]>}
     */
    async videoData(links) {
        const funcName = "videoData";
        API_CHECK(funcName);

        if (Array.isArray(links)) {
            let resultArray = [];
            for (const url of links) {
                try { resultArray.push(await videoRequest(url)) }
                catch (error) { resultArray.push({ error, video: url }) };
            }
            return resultArray;
        }

        if (stringCheck(links))
            return videoRequest(links)

        throw errBuild(funcName,
            `Invalid param type, String or String[] expected; got "${typeof links}" instead`);
    }
}