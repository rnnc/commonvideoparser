"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.setGoogleApiKey=setGoogleApiKey,exports.setVimeoApiConfig=setVimeoApiConfig,exports.getGoogleApiKey=getGoogleApiKey,exports.getVimeoApiConfig=getVimeoApiConfig,exports.parsingRegex=parsingRegex;let cache_googleApiKey=null,cache_vimeoConfig=null;const config_data=(a={new_googleApiKey:null,new_vimeoConfig:null})=>{const{new_googleApiKey:b,new_vimeoConfig:c}=a;return b&&(cache_googleApiKey=b),c&&(cache_vimeoConfig=c),{googleApiKey:cache_googleApiKey,vimeoConfig:cache_vimeoConfig}};function setGoogleApiKey(a){if(!a)throw"Google Api Key Missing";return config_data({new_googleApiKey:a}).googleApiKey}function setVimeoApiConfig(a){if(!a)throw`${"Vimeo Config missing"} parameter`;if(!a.CLIENT_ID)throw`${"Vimeo Config missing"} part CLIENT_ID`;if(!a.CLIENT_SECRET)throw`${"Vimeo Config missing"} part CLIENT_SECRET`;if(!a.ACCESS_TOKEN)throw`${"Vimeo Config missing"} part ACCESS_TOKEN`;return config_data({new_vimeoConfig:a}).vimeoConfig}function getGoogleApiKey(){return cache_googleApiKey}function getVimeoApiConfig(){return cache_vimeoConfig}function parsingRegex(a){if(!stringCheck(a))throw"(parsingRegex) - param 'type' has to be regex";const b=a.toLowerCase();if("youtube"===b)return{video:/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,playlist:/^.*(youtu\.be\/|list=)([^#\&\?]*).*/};if("gdrive"===b||"googledrive"===b)return /(?:.*)(?:drive\.google\.com\/file\/d\/|open\?id=|docs.google.com\/file\/d\/)([-\w]{25,})(?:.*)/;if("dailymotion"===b)return /^.*(dailymotion.com\/video\/|dai\.ly\/)([^_]+).*/;if("vimeo"===b)return /^.*(?:vimeo.com)\/(?:channels\/|channels\/\w+\/|groups\/[^\‌​/]*\/videos\/|album\‌​\d+\/video\/|video\‌​|)(\d+)(?:$|\/|\?)/;throw"(parsingRegex) Invalid type, has to be youtube/gdrive/dailymotion/vimeo"}