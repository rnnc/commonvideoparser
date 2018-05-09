"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _axios=_interopRequireDefault(require("axios")),_bluebird=_interopRequireDefault(require("bluebird")),_config=require("./config"),_helper=require("./helper"),_constants=require("./constants");exports.__esModule=!0,exports.default=void 0;const errBuild=(a,b)=>(0,_helper.errorBuild)("Youtube",a,b),API_CHECK=a=>{if(!(0,_config.getGoogleApiKey)())throw errBuild(a,`Google Api Key not set, use 'setGoogleApiKey'`);return!0},apiRequestUrl={videoInfo:"https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cid%2Cstatus&fields=items(contentDetails(duration%2Cprojection)%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Ctitle)%2Cstatus%2Fembeddable)&id=",playlistInfo:"https://www.googleapis.com/youtube/v3/playlists?part=contentDetails%2C+snippet&items(contentDetails%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Fhigh%2Ctitle)%2Cstatus)&id=",playlistItems:"https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2Csnippet&maxResults=50&fields=items(snippet(position%2CresourceId%2FvideoId)%2Cstatus)%2CnextPageToken%2CpageInfo%2FtotalResults&playlistId="},parseLink={video(a){const b=_constants.YOUTUBE_REGEX_VIDEO.exec(a);if(b)return b[2];throw"Video Link Parsing Error"},playlist(a){const b=_constants.YOUTUBE_REGEX_PLAYLIST.exec(a);if(b)return b[2];throw"Playlist Link Parsing Error"}};function buildRequestUrl(a,b,c){const d=`&key=${(0,_config.getGoogleApiKey)()}`,e=c?`pageToken=${c}`:"";if(a&&b){if("videoInfo"===a)return`${apiRequestUrl.videoInfo}${parseLink.video(b)}${d}`;if("multiVideoInfo"===a)return`${apiRequestUrl.videoInfo}${b}${d}`;if("playlistInfo"===a)return`${apiRequestUrl.playlistInfo}${parseLink.playlist(b)}${d}`;if("multiPlaylistInfo"===a)return`${apiRequestUrl.playlistInfo}${b}${d}`;if("playlistItems"===a)return`${apiRequestUrl.playlistItems}${parseLink.playlist(b)}&${e}${d}`;throw`::Internal:: Invalid Request Type - ${a}`}else throw`::Internal:: Fields "type" & "typeId" required`}function parseVideoData(a){const b=a.items.map(a=>{const{id:b,snippet:c,contentDetails:d,status:e}=a;return{title:c.title,duration:d.duration,link:`https://www.youtube.com/watch?v=${b}`,embeddable:e.embeddable,channel:c.channelTitle,description:c.description,published:c.publishedAt,thumbnail:c.thumbnails.high.url}});return 1<b.length?b:b[0]}function parsePlaylistInfoData(a){const b=a.items.map(a=>{const{id:b,snippet:c,contentDetails:d}=a;return{title:c.title,channel:c.channelTitle,description:c.description,link:`https://www.youtube.com/playlist?list=${b}`,itemCount:d.itemCount,published:c.publishedAt,thumbnail:c.thumbnails.high.url}});return 1<b.length?b:b[0]}async function videoInfoData(a){try{const b=buildRequestUrl("videoInfo",a),c=(await _axios.default.get(b)).data;return parseVideoData(c)}catch(a){throw a}}function multipleVideoData(a,b={parsedIds:!1}){const c=50;if(!("string"==typeof a[0]||a[0]instanceof String))throw new Error(`::Internal:: Array doesn't have type strings - `+`passed "${typeof a[0]}" instead`);let d=a.length;if(0==d)throw errBuild("multipleVideoData","Empty Array");let e=[];for(;0<d;){const f=a.length-d,g=d<c?f+d:f+c,h=[...a.slice(f,g)],i=b.parsedIds?h.map((a,b)=>b<h.length-1?`${a}%2C`:a).filter(a=>!!a):h.map((a,b)=>{try{return b<h.length-1?`${parseLink.video(a)}%2C`:parseLink.video(a)}catch(a){return!1}}).filter(a=>!!a);e.push(new _bluebird.default(async(a,b)=>{try{const b=buildRequestUrl("multiVideoInfo",i.join("")),c=(await _axios.default.get(b)).data;a(parseVideoData(c))}catch(a){b(a)}})),d-=g-f}return _bluebird.default.all(e.map(a=>a.reflect())).then(a=>[a.filter(a=>a.isFulfilled()).map(a=>a.value()),a.filter(a=>a.isRejected()).map(a=>a.reason())]).then(a=>[].concat(...a[0],...a[1]))}async function singlePlaylistInfoData(a){try{const b=buildRequestUrl("playlistInfo",a),c=(await _axios.default.get(b)).data;return parsePlaylistInfoData(c)}catch(a){throw a}}async function multiPlaylistInfoData(a){if(50<a.length)throw"Can only process 50 or less at a time";const b=a.map((b,c)=>{try{return c<a.length-1?`${parseLink.playlist(b)}%2C`:parseLink.playlist(b)}catch(a){return!1}}).filter(a=>!!a).join("");try{const a=buildRequestUrl("multiPlaylistInfo",b),c=(await _axios.default.get(a)).data;return parsePlaylistInfoData(c)}catch(a){throw a}}var _default={getGoogleApiKey:_config.getGoogleApiKey,setGoogleApiKey:_config.setGoogleApiKey,videoData(...a){if(API_CHECK("videoData"),0==a.length||(0,_helper.arrayCheck)(a[0])&&0==a[0].length)throw errBuild("videoData",`Empty`);try{if((0,_helper.stringCheck)(a[0]))return 1==a.length?videoInfoData(a[0]):multipleVideoData(a);if((0,_helper.arrayCheck)(a[0])&&(0,_helper.stringCheck)(a[0][0]))return 1==a[0].length?videoInfoData(a[0][0]):multipleVideoData(...a)}catch(a){throw errBuild("videoData",a)}throw errBuild("videoData",`Invalid param type, String(s) expected`)},playlistInfoData(...a){if(API_CHECK("playlistInfoData"),0==a.length||(0,_helper.arrayCheck)(a[0])&&0==a[0].length)throw errBuild("playlistInfoData",`Empty`);try{if((0,_helper.stringCheck)(a[0]))return 1==a.length?singlePlaylistInfoData(a[0]):multiPlaylistInfoData(a);if((0,_helper.arrayCheck)(a[0])&&(0,_helper.stringCheck)(a[0][0]))return 1==a[0].length?singlePlaylistInfoData(a[0][0]):multiPlaylistInfoData(a[0])}catch(a){throw errBuild("playlistInfoData",a)}throw errBuild("playlistInfoData",`Invalid param type, String(s) expected`)},async playlistVideoData(a){if(API_CHECK("playlistVideoData"),(0,_helper.arrayCheck)(a))throw errBuild("playlistVideoData","Can only handle one playlist at a time (got array)");if(!(0,_helper.stringCheck)(a))throw errBuild("playlistVideoData",`Invalid param type, expected String; got ${typeof a} instead`);try{const b=buildRequestUrl("playlistItems",a);let c=(await _axios.default.get(b)).data,d=c.items.map(a=>a.snippet.resourceId.videoId),{nextPageToken:e}=c;for(;e;){const b=buildRequestUrl("playlistItems",a,e);c=(await _axios.default.get(b)).data;const f=c.items.map(a=>a.snippet.resourceId.videoId);d.push(...f),e=c.nextPageToken}return await multipleVideoData(d,{parsedIds:!0})}catch(a){throw errBuild("playlistVideoData",a)}}};exports.default=_default;