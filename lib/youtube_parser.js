import axios from 'axios';
import Promise from 'bluebird';

import { getGoogleApiKey, setGoogleApiKey } from './config';
import { stringCheck, arrayCheck, errorBuild } from './helper';
import { YOUTUBE_REGEX_PLAYLIST, YOUTUBE_REGEX_VIDEO } from './constants';

const errBuild = (func, msg) => errorBuild("Youtube", func, msg);

const API_CHECK = (funcName) => {
    if (!getGoogleApiKey())
        throw errBuild(funcName, `Google Api Key not set, use 'setGoogleApiKey'`);
    return true;
}

// urls for api requests
const apiRequestUrl = {

    videoInfo: "https://www.googleapis.com/youtube/v3/videos?"
        + "part=snippet%2CcontentDetails%2Cid%2Cstatus&"
        + "fields=items(contentDetails(duration%2Cprojection)%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Ctitle)%2Cstatus%2Fembeddable)&id=",

    playlistInfo: "https://www.googleapis.com/youtube/v3/playlists?"
        + "part=contentDetails%2C+snippet&"
        + "items(contentDetails%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Fhigh%2Ctitle)%2Cstatus)&id=",

    playlistItems: "https://www.googleapis.com/youtube/v3/playlistItems?"
        + "part=contentDetails%2Csnippet&maxResults=50&"
        + "fields=items(snippet(position%2CresourceId%2FvideoId)%2Cstatus)%2CnextPageToken%2CpageInfo%2FtotalResults&playlistId="
};

//Takes youtube video/playlist links and returns id
const parseLink = {
    /** 
     * @description Get youtube video id from link 
     * @param {String} link youtube video link
     * @return {String} Parsed ID or false
     */
    video(link) {
        const parsed = YOUTUBE_REGEX_VIDEO.exec(link);
        if (parsed) return parsed[2];
        else throw "Video Link Parsing Error"
    },
    /** 
     * @description Get youtube playlist id from link
     * @param {String} link youtube playlist link
     * @returns {String} Parsed ID or false
     */
    playlist(link) {
        const parsed = YOUTUBE_REGEX_PLAYLIST.exec(link);
        if (parsed) return parsed[2];
        else throw "Playlist Link Parsing Error"
    }
};


/** 
 * @description Build youtube api request url
 * @param {String} type     "videoInfo", "playlistInfo", "playlistItems"
 * @param {String} typeLink   youtube video or playlist id depending on type
 * @param {String} [typeParam] param for nextpagetoken
 */
function buildRequestUrl(type, typeLink, typeParam) {
    const keyP = `&key=${getGoogleApiKey()}`;

    //nextPageToken
    const npt = typeParam ? `pageToken=${typeParam}` : "";

    if (type && typeLink) {

        if (type === "videoInfo")
            return `${apiRequestUrl.videoInfo}${parseLink.video(typeLink)}${keyP}`;

        else if (type === "multiVideoInfo")
            return `${apiRequestUrl.videoInfo}${typeLink}${keyP}`;

        else if (type === "playlistInfo")
            return `${apiRequestUrl.playlistInfo}${parseLink.playlist(typeLink)}${keyP}`;

        else if (type === "multiPlaylistInfo")
            return `${apiRequestUrl.playlistInfo}${typeLink}${keyP}`;

        else if (type === "playlistItems")
            return `${apiRequestUrl.playlistItems}${parseLink.playlist(typeLink)}&${npt}${keyP}`;

        else
            throw `::Internal:: Invalid Request Type - ${type}`;

    } else throw `::Internal:: Fields "type" & "typeId" required`;
};


/** 
 * @description Parses raw api data for videos
 * @param {JSON} raw_data Raw data from Youtube API
 * @returns {"videoData"|["videoData"]} returns object of video info 
 */
function parseVideoData(raw_data) {

    const result = raw_data.items.map(resItems => {

        const { id, snippet, contentDetails, status } = resItems;

        return {
            title: snippet.title,
            duration: contentDetails.duration,
            link: `https://www.youtube.com/watch?v=${id}`,
            embeddable: status.embeddable,
            channel: snippet.channelTitle,
            description: snippet.description,
            published: snippet.publishedAt,
            thumbnail: snippet.thumbnails.high.url
        }
    })

    return result.length > 1 ? result : result[0];
};

/**
 * @description Parses raw api data for playlist information
 * @param {JSON} raw_data 
 * @returns {"playlistInfoData"|["playlistInfoData"]}
 */
function parsePlaylistInfoData(raw_data) {

    const result = raw_data.items.map(resItems => {

        const { id, snippet, contentDetails } = resItems;

        return {
            title: snippet.title,
            channel: snippet.channelTitle,
            description: snippet.description,
            link: `https://www.youtube.com/playlist?list=${id}`,
            itemCount: contentDetails.itemCount,
            published: snippet.publishedAt,
            thumbnail: snippet.thumbnails.high.url
        }
    })

    return result.length > 1 ? result : result[0];
}


/** 
 * @description Requests Youtube video info from Youtube API V3
 * @param {String} videoLink youtube video link
 * @return {Promise<"videoData">} 
 */
async function videoInfoData(videoLink) {
    try {
        const uri = buildRequestUrl("videoInfo", videoLink);
        const pData = (await axios.get(uri)).data;
        return parseVideoData(pData);
    } catch (error) { throw error }
};


/** 
 * @description Get youtube video info for multiple videos
 * @param {[String]} videoLinks array of youtube video links
 * @param {{parsedIds:Boolean}} [options] if Ids already parsed, skip parsing
 * @return {Promise}
 */
function multipleVideoData(videoLinks, options = { parsedIds: false }) {
    const funcName = "multipleVideoData";

    const maxBatch = 50;

    if (!(typeof videoLinks[0] === "string" || videoLinks[0] instanceof String))
        throw new Error(`::Internal:: Array doesn't have type strings - `
            + `passed "${typeof videoLinks[0]}" instead`);

    let remainingVideos = videoLinks.length;
    if (remainingVideos == 0)
        throw errBuild(funcName, 'Empty Array');

    let promiseArray = [];

    while (remainingVideos > 0) {

        const startIndex = videoLinks.length - remainingVideos;

        const stopIndex = (remainingVideos < maxBatch)
            ? startIndex + remainingVideos
            : startIndex + maxBatch;

        const buffer = [...videoLinks.slice(startIndex, stopIndex)];

        // Written this way to accomodate for playlistVideoData
        // and array of youtube links

        const chainedVideoIds = (options.parsedIds)

            ? buffer.map((link, bIndex) =>

                (bIndex < (buffer.length - 1))
                    ? `${link}%2C`
                    : link

            ).filter(x => !!x)

            : buffer.map((link, bIndex) => {

                try {
                    return (bIndex < (buffer.length - 1))
                        ? `${parseLink.video(link)}%2C`
                        : parseLink.video(link);
                } catch (e) { return false; }

            }).filter(x => !!x);

        promiseArray.push(new Promise(async (resolve, reject) => {

            try {
                const uri = buildRequestUrl("multiVideoInfo", chainedVideoIds.join(''));
                const result = (await axios.get(uri)).data;
                resolve(parseVideoData(result));
            } catch (error) { reject(error); }

        }));


        remainingVideos -= (stopIndex - startIndex);
    }

    return Promise.all(promiseArray.map(p => p.reflect()))
        .then(values => [
            values.filter(x => x.isFulfilled()).map(x => x.value()),
            values.filter(x => x.isRejected()).map(x => x.reason())
        ]).then(arr => [].concat(...arr[0], ...arr[1]));
};

async function singlePlaylistInfoData(link) {
    try {
        const url = buildRequestUrl("playlistInfo", link);
        const result = (await axios.get(url)).data;
        return parsePlaylistInfoData(result);
    } catch (error) { throw error }
}

async function multiPlaylistInfoData(links) {

    if (links.length > 50)
        throw "Can only process 50 or less at a time"

    const parsedIds = links.map((link, pIndex) => {
        try {
            return (pIndex < links.length - 1)
                ? `${parseLink.playlist(link)}%2C`
                : parseLink.playlist(link)
        } catch (e) { return false }
    }).filter(x => !!x).join('');

    try {
        const uri = buildRequestUrl("multiPlaylistInfo", parsedIds);
        const result = (await axios.get(uri)).data;
        return parsePlaylistInfoData(result);
    } catch (error) { throw error }
}

export default {

    getGoogleApiKey,

    setGoogleApiKey,

    /**
     * @description Returns youtube video info about single link, or array of links
     * @param {String, [String]} links single video link or array of video links
     * @return {Promise}
     */
    videoData(...links) {
        const funcName = "videoData";

        API_CHECK(funcName);

        if ((links.length == 0) ||
            (arrayCheck(links[0]) && (links[0].length == 0)))
            throw errBuild(funcName, `Empty`);

        try {

            if (stringCheck(links[0]))
                return (links.length == 1)
                    ? videoInfoData(links[0])
                    : multipleVideoData(links)

            if (arrayCheck(links[0]) && stringCheck(links[0][0]))
                return (links[0].length == 1)
                    ? videoInfoData(links[0][0])
                    : multipleVideoData(...links);

        } catch (error) { throw errBuild(funcName, error) }

        throw errBuild(funcName, `Invalid param type, String(s) expected`)
    },

    /** 
     * @description Requests playlist info from Youtube API V3
     * @param {String|[String]} playlistLinks youtube playlist links
     * @return {Promise}
     */
    playlistInfoData(...playlistLinks) {
        const funcName = "playlistInfoData";

        API_CHECK(funcName);

        if ((playlistLinks.length == 0) ||
            (arrayCheck(playlistLinks[0]) && (playlistLinks[0].length == 0)))
            throw errBuild(funcName, `Empty`);

        try {

            if (stringCheck(playlistLinks[0]))
                return (playlistLinks.length == 1)
                    ? singlePlaylistInfoData(playlistLinks[0])
                    : multiPlaylistInfoData(playlistLinks);

            if (arrayCheck(playlistLinks[0]) && stringCheck(playlistLinks[0][0]))
                return (playlistLinks[0].length == 1)
                    ? singlePlaylistInfoData(playlistLinks[0][0])
                    : multiPlaylistInfoData(playlistLinks[0]);

        } catch (error) { throw errBuild(funcName, error) };

        throw errBuild(funcName, `Invalid param type, String(s) expected`);
    },

    /** 
     * @description Return list of videos from youtube playlist link using google api
     * @param {String} playlistLink Youtube Playlist Link
     * @return {Promise} Promise returns info object with array
     */
    async playlistVideoData(playlistLink) {
        const funcName = "playlistVideoData";

        API_CHECK(funcName);

        if (arrayCheck(playlistLink))
            throw errBuild(funcName, "Can only handle one playlist at a time (got array)");

        if (!stringCheck(playlistLink))
            throw errBuild(funcName,
                `Invalid param type, expected String; got ${typeof playlistLink} instead`);

        // Get all the video links from the playlist first
        try {
            const init_uri = buildRequestUrl("playlistItems", playlistLink);

            let playlist_data = (await axios.get(init_uri)).data;

            let youtubeLinks = playlist_data.items.map(x => x.snippet.resourceId.videoId);
            let { nextPageToken } = playlist_data;
            while (nextPageToken) {
                const npt_uri = buildRequestUrl("playlistItems", playlistLink, nextPageToken)
                playlist_data = (await axios.get(npt_uri)).data;
                const mapLinks = playlist_data.items.map(x => x.snippet.resourceId.videoId)
                youtubeLinks.push(...mapLinks);
                nextPageToken = playlist_data.nextPageToken;
            }

            // Take all video links from playlist & get videos

            return await multipleVideoData(youtubeLinks, { parsedIds: true });

        } catch (error) { throw errBuild(funcName, error) }
    }
};