Common Video Parser
======

An easy way to get info from API of common video parsing websites.

Supported as of now

* Youtube
* Vimeo
* Dailymotion
* Google Drive (video files)

*Disclaimer: You have to provide your own API Authentication info for Vimeo & Youtube/Google Drive (can use same key for both technically).*

##### To Do : 
- Add typings file
- Non specifc get function that auto parses link and gets data
- Make returned data fields/objects more consistent

## Changelog:
(1.1.0)
- Uses bluebird promises and axios now instead of request-promise
- optimized code, reduced average time for multi-requests by atleast 40%

# Installation

`npm i commonvideoparser`

`yarn add commonvideoparser`

# Testing

`npm run test`

`yarn run test`

If you have jest installed globally, simply run `jest` in folder



# How To Use

Make sure you have enabled Youtube & Google Drive API for your app key;

This app doesn't use oAuth, use simple API key

https://console.developers.google.com

Get Vimeo auth config

https://developer.vimeo.com/

## Initialize

```js

const vLib = require('commonvideoparser');

vLib.setGoogleApiKey("XXXXXXXXXXXXXXXXXX");

vLib.setVimeoApiConfig({
  CLIENT_ID:"XXXXXXXXXXXXXXXXXX",
  CLIENT_SECRET:"XXXXXXXXXXXXXXXXXX",
  ACCESS_TOKEN:"XXXXXXXXXXXXXXXXXX"
});

// These functions also return the config obj/key after setting it

```


#### __Individual video libraries return promises, can be handled with async/await__



## Youtube

### Single/Multiple Video Links

```js

vLib.youtube.videoData("https://www.youtube.com/watch?v=XXXXXXX")
  .then(result=>{
    // do whatever with data
  })
  .catch(error=>console.log(error));

// Shortened links also work
// https://youtu.be/XXXXXXXXXXX

vLib.youtube.videoData("https://www.youtube.com/watch?v=XXXXXXX","https://youtu.be/XXXXXXX")

// Can also pass array of videos
vLib.youtube.videoData([link1, link2])

```
### Playlist Info 

Basic Playlist Info, not the actual videos of the playlist

```js

vLib.youtube.playlistInfoData("https://www.youtube.com/playlist?list=XXXXXXXXXXX")

vLib.youtube.playlistInfoData("https://www.youtube.com/playlist?list=XXXXXXXXXXX",
  "https://www.youtube.com/playlist?list=XXXXXXXXXXX")

// Can also pass array

vLib.youtube.playlistInfoData([link1,link2])

```

### Playlist Video Data

```js

vLib.youtube.playlistVideoData("https://www.youtube.com/playlist?list=XXXXXXXXXXX")

// Same as others, can pass array of playlist links

```

## Vimeo

```js

vLib.vimeo.videoData("https://vimeo.com/XXXXXXX")

// Same as others, can pass array of video links

```

## Dailymotion

```js

vLib.dailymotion.videoData([
  "http://dai.ly/XXXXXXX",
  "http://www.dailymotion.com/video/XXXXXXX"
])

// can pass array and shortened urls

```

## Google Drive

```js

vLib.dailymotion.videoData([
  "https://drive.google.com/file/d/XXXXXXXXXXXXXXXXXXXXXXXXXXX/preview",
  "https://docs.google.com/file/d/XXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "https://drive.google.com/open?id=XXXXXXXXXXXXXXXXXXXXXXXXXXX"
])

// Can pass array and different variations of the link

```
---

## __Data Returned__

|   Youtube   |     Vimeo    | Dailymotion | Google Drive |
| ----------- | ------------ | ----------- | ------------ |
| title       | name         | title       | title        |
| duration    | duration     | duration    | duration     |
| link        | link         | link        | link         |
| embeddable  | user         | createdTime | size         |
| channel     | description  | dimensions  | createdTime  |
| description | created_time | thumbnail   | thumbnail    |
| published   | release_time |             | dimensions   |
| thumbnail   | dimensions   |             |              |
|             | thumbnail    |             |              |

---

# ES6

If you want to use individual modules, you can set API/Config directly from within.

(For Youtube, Google Drive, Vimeo)

```js

import { vimeo as vm } from 'commonvideoparser';

vm.setVimeoApiConfig({
  CLIENT_ID:"XXXXXXXXXXXXXXXXXX",
  CLIENT_SECRET:"XXXXXXXXXXXXXXXXXX",
  ACCESS_TOKEN:"XXXXXXXXXXXXXXXXXX"
});

```
---
