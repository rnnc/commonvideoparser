import youtube from './youtube_parser';
import vimeo from './vimeo_parser';
import dailymotion from './dailymotion_parser';
import gdrive from './gdrive_parser';

export { youtube, vimeo, dailymotion, gdrive };

export {
  setGoogleApiKey,
  setVimeoApiConfig,
  getGoogleApiKey,
  getVimeoApiConfig
} from './config';
