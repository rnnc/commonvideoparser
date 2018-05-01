import rp from 'request-promise';

import { getGoogleApiKey, setGoogleApiKey, parsingRegex } from './config';
import { stringCheck, errorBuild } from './helper';

const errBuild = (func, msg) => errorBuild("Youtube", func, msg);

const API_CHECK = (funcName) => {
    if (!getGoogleApiKey())
        throw errBuild(funcName, `Google Api Key not set, use 'setGoogleApiKey'`);
    return true;
}

const url_regex = parsingRegex("youtube");

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
        const parsed = url_regex.video.exec(link);
        if (parsed) return parsed[2];
        else throw errBuild(null, "Video Link Parsing Error")
    },
    /** 
     * @description Get youtube playlist id from link
     * @param {String} link youtube playlist link
     * @returns {String} Parsed ID or false
     */
    playlist(link) {
        const parsed = url_regex.playlist.exec(link);
        if (parsed) return parsed[2];
        else throw errBuild(null, "Playlist Link Parsing Error")
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

    const pData = JSON.parse(raw_data);

    const result = pData.items.map(resItems => {
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

    const pData = JSON.parse(raw_data);

    const result = pData.items.map(resItems => {
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
 * @return {"videoData"} 
 */
async function videoInfoData(videoLink) {
    const uri = buildRequestUrl("videoInfo", videoLink);
    const pData = await rp.get(uri)
    return parseVideoData(pData);
};

/** 
 * @description Get youtube video info for multiple videos
 * @param {[String]} videoLinks array of youtube video links
 * @param {{parsedIds:Boolean}} [options] if Ids already parsed, skip parsing
 * @return {Promise}
 */
async function multipleVideoData(videoLinks, options = { parsedIds: false }) {
    const funcName = "multipleVideoData";

    const maxBatch = 50;

    if (!(typeof videoLinks[0] === "string" || videoLinks[0] instanceof String))
        throw new Error(`::Internal:: Array doesn't have type strings - `
            + `passed "${typeof videoLinks[0]}" instead`);

    let remainingVideos = videoLinks.length;
    if (remainingVideos == 0)
        throw errBuild(funcName, 'Empty Array');

    let processedVideoInfo = [];

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

        try {
            const uri = buildRequestUrl("multiVideoInfo", chainedVideoIds.join(''));
            const result = await rp.get(uri);
            processedVideoInfo.push(...parseVideoData(result));
        } catch (error) { throw error }

        remainingVideos -= (stopIndex - startIndex);
    }

    return processedVideoInfo;
};

export default {

    getGoogleApiKey,

    setGoogleApiKey,

    /**
     * @description Returns youtube video info about single link, or array of links
     * @param {String, [String]} links single video link or array of video links
     * @return {Promise}
     */
    async videoData(links) {
        const funcName = "videoData";

        API_CHECK(funcName);

        if (Array.isArray(links)) {

            if (links.length == 0)
                throw errBuild(funcName, "Empty Array of links");

            return multipleVideoData(links)
        }

        if (stringCheck(links))
            return videoInfoData(links)

        throw errBuild(funcName,
            `Invalid param type, String or String[] expected, got ${typeof links} instead`)
    },

    /** 
     * @description Requests playlist info from Youtube API V3
     * @param {String|[String]} playlistLink youtube playlist link
     * @return {Promise}
     */
    async playlistInfoData(playlistLink) {

        const funcName = "playlistInfoData";

        API_CHECK(funcName);

        if (Array.isArray(playlistLink)) {
            const parsedIds = playlistLink.map((link, pIndex) => {
                try {
                    return (pIndex < playlistLink.length - 1)
                        ? `${parseLink.playlist(link)}%2C`
                        : parseLink.playlist(link)
                } catch (e) { return false }
            }).filter(x => !!x).join('');

            const uri = buildRequestUrl("multiPlaylistInfo", parsedIds);
            const result = await rp.get(uri);

            return parsePlaylistInfoData(result);
        }

        if (stringCheck(playlistLink)) {
            const uri = buildRequestUrl("playlistInfo", playlistLink);
            const result = await rp.get(uri);
            return parsePlaylistInfoData(result);
        }

        throw errBuild(funcName,
            `Invalid param type, expected String or String[]; got ${typeof playlistLink} instead`);

    },

    /** 
     * @description Return list of videos from youtube playlist link using google api
     * @param {String} playlistLink Youtube Playlist Link
     * @return {Promise} Promise returns info object with array
     */
    async playlistVideoData(playlistLink) {
        const funcName = "playlistVideoData";

        API_CHECK(funcName);

        if (Array.isArray(playlistLink))
            throw errBuild(funcName, "Can only handle one playlist at a time");

        if (!stringCheck(playlistLink))
            throw errBuild(funcName,
                `Invalid param type, expected String; got ${typeof playlistLink} instead`);

        // Get all the video links from the playlist first

        const init_uri = buildRequestUrl("playlistItems", playlistLink);

        let playlist_data = JSON.parse(await rp.get(init_uri));

        let youtubeLinks = playlist_data.items.map(x => x.snippet.resourceId.videoId);
        let { nextPageToken } = playlist_data;
        while (nextPageToken) {
            const npt_uri = buildRequestUrl("playlistItems", playlistLink, nextPageToken)
            playlist_data = JSON.parse(await rp.get(npt_uri));
            const mapLinks = playlist_data.items.map(x => x.snippet.resourceId.videoId)
            youtubeLinks.push(...mapLinks);
            nextPageToken = playlist_data.nextPageToken;
        }

        // Take all video links from playlist & get videos

        return await multipleVideoData(youtubeLinks, { parsedIds: true });
    }
};