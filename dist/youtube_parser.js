'use strict';Object.defineProperty(exports,'__esModule',{value:!0});var _requestPromise=require('request-promise'),_requestPromise2=_interopRequireDefault(_requestPromise),_config=require('./config'),_helper=require('./helper');function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}const errBuild=(a,b)=>(0,_helper.errorBuild)('Youtube',a,b),API_CHECK=a=>{if(!(0,_config.getGoogleApiKey)())throw errBuild(a,`Google Api Key not set, use 'setGoogleApiKey'`);return!0},url_regex=(0,_config.parsingRegex)('youtube'),apiRequestUrl={videoInfo:'https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cid%2Cstatus&fields=items(contentDetails(duration%2Cprojection)%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Ctitle)%2Cstatus%2Fembeddable)&id=',playlistInfo:'https://www.googleapis.com/youtube/v3/playlists?part=contentDetails%2C+snippet&items(contentDetails%2Cid%2Csnippet(channelTitle%2Cdescription%2CpublishedAt%2Cthumbnails%2Fhigh%2Ctitle)%2Cstatus)&id=',playlistItems:'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2Csnippet&maxResults=50&fields=items(snippet(position%2CresourceId%2FvideoId)%2Cstatus)%2CnextPageToken%2CpageInfo%2FtotalResults&playlistId='},parseLink={video(a){const b=url_regex.video.exec(a);if(b)return b[2];throw errBuild(null,'Video Link Parsing Error')},playlist(a){const b=url_regex.playlist.exec(a);if(b)return b[2];throw errBuild(null,'Playlist Link Parsing Error')}};function buildRequestUrl(a,b,c){const d=`&key=${(0,_config.getGoogleApiKey)()}`,e=c?`pageToken=${c}`:'';if(a&&b){if('videoInfo'===a)return`${apiRequestUrl.videoInfo}${parseLink.video(b)}${d}`;if('multiVideoInfo'===a)return`${apiRequestUrl.videoInfo}${b}${d}`;if('playlistInfo'===a)return`${apiRequestUrl.playlistInfo}${parseLink.playlist(b)}${d}`;if('multiPlaylistInfo'===a)return`${apiRequestUrl.playlistInfo}${b}${d}`;if('playlistItems'===a)return`${apiRequestUrl.playlistItems}${parseLink.playlist(b)}&${e}${d}`;throw`::Internal:: Invalid Request Type - ${a}`}else throw`::Internal:: Fields "type" & "typeId" required`}function parseVideoData(a){const b=JSON.parse(a),c=b.items.map(a=>{const{id:b,snippet:c,contentDetails:d,status:e}=a;return{title:c.title,duration:d.duration,link:`https://www.youtube.com/watch?v=${b}`,embeddable:e.embeddable,channel:c.channelTitle,description:c.description,published:c.publishedAt,thumbnail:c.thumbnails.high.url}});return 1<c.length?c:c[0]}function parsePlaylistInfoData(a){const b=JSON.parse(a),c=b.items.map(a=>{const{id:b,snippet:c,contentDetails:d}=a;return{title:c.title,channel:c.channelTitle,description:c.description,link:`https://www.youtube.com/playlist?list=${b}`,itemCount:d.itemCount,published:c.publishedAt,thumbnail:c.thumbnails.high.url}});return 1<c.length?c:c[0]}async function videoInfoData(a){const b=buildRequestUrl('videoInfo',a),c=await _requestPromise2.default.get(b);return parseVideoData(c)}async function multipleVideoData(a,b={parsedIds:!1}){if(!('string'==typeof a[0]||a[0]instanceof String))throw new Error(`::Internal:: Array doesn't have type strings - `+`passed "${typeof a[0]}" instead`);let c=a.length;if(0==c)throw errBuild('multipleVideoData','Empty Array');let d=[];for(;0<c;){const e=a.length-c,f=c<50?e+c:e+50,g=[...a.slice(e,f)],h=b.parsedIds?g.map((a,b)=>b<g.length-1?`${a}%2C`:a).filter(a=>!!a):g.map((a,b)=>{try{return b<g.length-1?`${parseLink.video(a)}%2C`:parseLink.video(a)}catch(a){return!1}}).filter(a=>!!a);try{const a=buildRequestUrl('multiVideoInfo',h.join('')),b=await _requestPromise2.default.get(a);d.push(...parseVideoData(b))}catch(a){throw a}c-=f-e}return d}exports.default={getGoogleApiKey:_config.getGoogleApiKey,setGoogleApiKey:_config.setGoogleApiKey,async videoData(a){if(API_CHECK('videoData'),Array.isArray(a)){if(0==a.length)throw errBuild('videoData','Empty Array of links');return multipleVideoData(a)}if((0,_helper.stringCheck)(a))return videoInfoData(a);throw errBuild('videoData',`Invalid param type, String or String[] expected, got ${typeof a} instead`)},async playlistInfoData(a){if(API_CHECK('playlistInfoData'),Array.isArray(a)){const b=a.map((b,c)=>{try{return c<a.length-1?`${parseLink.playlist(b)}%2C`:parseLink.playlist(b)}catch(a){return!1}}).filter(a=>!!a).join(''),c=buildRequestUrl('multiPlaylistInfo',b),d=await _requestPromise2.default.get(c);return parsePlaylistInfoData(d)}if((0,_helper.stringCheck)(a)){const b=buildRequestUrl('playlistInfo',a),c=await _requestPromise2.default.get(b);return parsePlaylistInfoData(c)}throw errBuild('playlistInfoData',`Invalid param type, expected String or String[]; got ${typeof a} instead`)},async playlistVideoData(a){if(API_CHECK('playlistVideoData'),Array.isArray(a))throw errBuild('playlistVideoData','Can only handle one playlist at a time');if(!(0,_helper.stringCheck)(a))throw errBuild('playlistVideoData',`Invalid param type, expected String; got ${typeof a} instead`);const b=buildRequestUrl('playlistItems',a);let c=JSON.parse((await _requestPromise2.default.get(b))),d=c.items.map(a=>a.snippet.resourceId.videoId),{nextPageToken:e}=c;for(;e;){const b=buildRequestUrl('playlistItems',a,e);c=JSON.parse((await _requestPromise2.default.get(b)));const f=c.items.map(a=>a.snippet.resourceId.videoId);d.push(...f),e=c.nextPageToken}return await multipleVideoData(d,{parsedIds:!0})}};