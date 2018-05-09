export const YOUTUBE_REGEX_VIDEO = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
export const YOUTUBE_REGEX_PLAYLIST = /^.*(youtu\.be\/|list=)([^#\&\?]*).*/;

export const GOOGLEDRIVE_REGEX = /(?:.*)(?:drive\.google\.com\/file\/d\/|open\?id=|docs.google.com\/file\/d\/)([-\w]{25,})(?:.*)/;

export const DAILYMOTION_REGEX = /^.*(dailymotion.com\/video\/|dai\.ly\/)([^_]+).*/;

export const VIMEO_REGEX = /^.*(?:vimeo.com)\/(?:channels\/|channels\/\w+\/|groups\/[^\‌​/]*\/videos\/|album\‌​\d+\/video\/|video\‌​|)(\d+)(?:$|\/|\?)/;
