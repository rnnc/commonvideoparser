"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _axios=_interopRequireDefault(require("axios")),_bluebird=_interopRequireDefault(require("bluebird")),_moment=_interopRequireDefault(require("moment")),_helper=require("./helper"),_constants=require("./constants");exports.__esModule=!0,exports.default=void 0;const errBuild=(a,b)=>errBuild("Dailymotion",a,b);function buildRequest(a){const b=_constants.DAILYMOTION_REGEX.exec(a);if(b)return`https://api.dailymotion.com/video/${b[2]}`+`?fields=channel,created_time,duration,height,thumbnail_url,title,url,width,`;throw"Failed to parse link"}function parseVideoData(a){const{title:b,url:c,duration:d,created_time:e,width:f,height:g,thumbnail_url:h}=a;return{title:b,duration:_moment.default.duration(d,"s").toISOString(),link:c,createdTime:_moment.default.unix(e).toISOString(),dimensions:f+" x "+g,thumbnail:h}}async function videoInfoData(a){try{const b=buildRequest(a),c=(await _axios.default.get(b)).data;return parseVideoData(c)}catch(a){throw a}}function multiVideoData(a){const b=a.map(a=>new _bluebird.default(async(b,c)=>{videoInfoData(a).then(a=>b(a)).catch(b=>c({error:b,link:a}))}));return _bluebird.default.all(b.map(a=>a.reflect())).then(a=>[a.filter(a=>a.isFulfilled()).map(a=>a.value()),a.filter(a=>a.isRejected()).map(a=>a.reason())]).then(a=>[].concat.apply([],a))}var _default={async videoData(...a){if(0==a.length||(0,_helper.arrayCheck)(a[0])&&0==a[0].length)throw errBuild("videoData",`Empty`);try{if((0,_helper.stringCheck)(a[0]))return 1==a.length?videoInfoData(a[0]):multiVideoData(a);if((0,_helper.arrayCheck)(a[0])&&(0,_helper.stringCheck)(a[0][0]))return 1==a[0].length?videoInfoData(a[0][0]):multiVideoData(a[0])}catch(a){throw errBuild("videoData",a)}throw errBuild("videoData",`Invalid param type, String(s) expected`)}};exports.default=_default;