import moment from 'moment';
import Promise from 'bluebird';
import { Vimeo } from 'vimeo';

import { getVimeoApiConfig, setVimeoApiConfig } from './config';
import { stringCheck, arrayCheck, errorBuild } from './helper';
import { VIMEO_REGEX } from './constants';


const errBuild = (func, msg) => errorBuild("Vimeo", func, msg);


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
    const parsed = VIMEO_REGEX.exec(link);
    if (parsed) return parsed[1];
    throw "Failed to parse link";
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
        duration: moment.duration(duration, "s").toISOString(), //duration is in secs        
        link: raw_data.link,
        description: raw_data.description,
        user: user.name,
        created_time,
        release_time,
        dimensions: `${width} x ${height}`,
        thumbnail: raw_data.pictures.sizes.pop().link.replace('?r=pad', '')
    }
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

function multiVideoRequest(links) {

    const promiseArray = links.map(link =>
        new Promise(async (resolve, reject) => {
            videoRequest(link)
                .then(res => resolve(res))
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

    setVimeoApiConfig,

    /** 
     * @description takes single or array of vimeo links & gets info
     * returns array of results that have parsed video info
     * or error with video link
     * @param {String|[String]} links
     * @returns {Promise<"parsedData"|["parsedData"]>}
     */
    async videoData(...links) {
        const funcName = "videoData";

        if (!getVimeoApiConfig())
            throw errBuild(funcName,
                `Vimeo Api Config not set, use 'setVimeoApiConfig'`);

        if ((links.length == 0) ||
            (arrayCheck(links[0]) && (links[0].length == 0)))
            throw errBuild(funcName, `Empty`);

        try {

            if (stringCheck(links[0]))
                return (links.length == 1)
                    ? videoRequest(links[0])
                    : multiVideoRequest(links);

            if (arrayCheck(links[0]) && stringCheck(links[0][0]))
                return (links[0].length == 1)
                    ? videoRequest(links[0][0])
                    : multiVideoRequest(links[0]);

        } catch (error) { throw errBuild(funcName, error) }

        throw errBuild(funcName, `Invalid param type, String(s) expected`);
    }
}