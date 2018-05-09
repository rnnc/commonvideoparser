import { stringCheck } from './helper';

/** @type {String} */
let cache_googleApiKey = null;

/** @type {VIMEO_CONFIG} */
let cache_vimeoConfig = null;

/**
 * @description Either sets or returns previously set config data from file
 * @param {{new_googleApiKey:String, new_vimeoConfig:VIMEO_CONFIG}} new_config 
 * @return {{googleApiKey:String, vimeoConfig: VIMEO_CONFIG}}
 */
function setConfigData(new_config = { new_googleApiKey: null, new_vimeoConfig: null }) {

  const { new_googleApiKey, new_vimeoConfig } = new_config;

  if (new_googleApiKey)
    cache_googleApiKey = new_googleApiKey;

  if (new_vimeoConfig)
    cache_vimeoConfig = new_vimeoConfig;

  return {
    googleApiKey: cache_googleApiKey,
    vimeoConfig: cache_vimeoConfig
  };

};


/**
 * @description Sets Google API key, overrides last one, returns set data
 * @param {String} new_googleApiKey 
 * @return {String}
 */
export function setGoogleApiKey(new_googleApiKey) {

  if (!new_googleApiKey)
    throw "Google Api Key Missing"

  return setConfigData({ new_googleApiKey }).googleApiKey;
};

/**
 * @description Sets Vimeo Config info, overrides last one, returns set data
 * @param {VIMEO_CONFIG} new_vimeoConfig 
 * @return {VIMEO_CONFIG}
 */
export function setVimeoApiConfig(new_vimeoConfig) {

  const e_msg = "Vimeo Config missing"

  if (!new_vimeoConfig)
    throw `${e_msg} parameter`;

  if (!new_vimeoConfig.CLIENT_ID)
    throw `${e_msg} part CLIENT_ID`;

  if (!new_vimeoConfig.CLIENT_SECRET)
    throw `${e_msg} part CLIENT_SECRET`;

  if (!new_vimeoConfig.ACCESS_TOKEN)
    throw `${e_msg} part ACCESS_TOKEN`;

  return setConfigData({ new_vimeoConfig }).vimeoConfig;
};

export function getGoogleApiKey() { return cache_googleApiKey };

/** 
 * @description 
 * @return {VIMEO_CONFIG} 
 */
export function getVimeoApiConfig() { return cache_vimeoConfig };

/**
 * @description returns regex for parsing URLs
 * @param {String} type "youtube"/"gdrive"/"dailymotion"/"vimeo"
 */
export function parsingRegex(type) {

  if (!stringCheck(type))
    throw "(parsingRegex) - param 'type' has to be regex"

  const lType = type.toLowerCase();

  if (lType === "youtube")
    return {
      video: /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
      playlist: /^.*(youtu\.be\/|list=)([^#\&\?]*).*/
    }

  if (lType === "gdrive" || lType === "googledrive")
    return /(?:.*)(?:drive\.google\.com\/file\/d\/|open\?id=|docs.google.com\/file\/d\/)([-\w]{25,})(?:.*)/

  if (lType === "dailymotion")
    return /^.*(dailymotion.com\/video\/|dai\.ly\/)([^_]+).*/

  if (lType === "vimeo")
    return /^.*(?:vimeo.com)\/(?:channels\/|channels\/\w+\/|groups\/[^\‌​/]*\/videos\/|album\‌​\d+\/video\/|video\‌​|)(\d+)(?:$|\/|\?)/

  throw "(parsingRegex) Invalid type, has to be youtube/gdrive/dailymotion/vimeo";
}

/**
 * @description Vimeo api config data
 * @typedef {Object} VIMEO_CONFIG
 * @property {String} CLIENT_ID
 * @property {String} CLIENT_SECRET
 * @property {String} ACCESS_TOKEN
 */