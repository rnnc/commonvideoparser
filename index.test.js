const vLib = require('./index');

// Test Config Data, dedicated for tests

const test_vConfig = {
  CLIENT_ID: "1d2a352e8cb1d9938844e0460328933e587bf8a2",
  CLIENT_SECRET: "7jroe1UHAmn+p108nWqk4YTZc+SX5wnhl+Fl8AbMPLb4+v932PrWQOc26yvJ5wpAg5u9M2kX7pEEwXEbixFGJj7f89J8exSLd5pYMpojs3obqUw/GnRfr7cXeM44l41v",
  ACCESS_TOKEN: "eb8b554c12d5a054589991c61d492753"
};
const test_gApiKey = "AIzaSyCx9UVNv3aiJ4hflfoCobRckz6pQpnbQbM";

// Test Data

const test_vData_yt = [
  {
    title: 'Me at the zoo',
    duration: 'PT19S',
    link: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    embeddable: true,
    channel: 'jawed',
    description: 'The first video on YouTube. Maybe it\'s time to go back to the zoo? The name of the music playing in the background is Darude - Sandstorm.',
    published: '2005-04-24T03:31:52.000Z',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg'
  },
  {
    title: 'YouTube on the tube!',
    duration: 'PT7M4S',
    link: 'https://www.youtube.com/watch?v=rdwz7QiG0lk',
    embeddable: true,
    channel: 'YouTube Spotlight',
    description: 'YouTube was featured on "Call for Help with Leo Laporte" by host Amber MacArthur.',
    published: '2005-10-28T20:38:57.000Z',
    thumbnail: 'https://i.ytimg.com/vi/rdwz7QiG0lk/hqdefault.jpg'
  }
]

const test_pData_yt = [
  {
    title: 'Worth It',
    channel: 'BuzzFeedVideo',
    description: '',
    link: 'https://www.youtube.com/playlist?list=PL5vtqDuUM1DmXwYYAQcyUwtcalp_SesZD',
    itemCount: 47,
    published: '2016-10-08T01:07:48.000Z',
    thumbnail: 'https://i.ytimg.com/vi/oipLbJoV9pM/hqdefault.jpg'
  },
  {
    title: 'Sexual Assault Awareness Month: Resources',
    channel: 'YouTube Spotlight',
    description: '',
    link: 'https://www.youtube.com/playlist?list=PLbpi6ZahtOH4NWT2AIX4Z0ToNsjRxa02_',
    itemCount: 8,
    published: '2018-03-29T00:03:16.000Z',
    thumbnail: 'https://i.ytimg.com/vi/z0bPaEERYj8/hqdefault.jpg'
  }
]

const test_vData_vm = [
  {
    name: 'How To Turn A Beer Can Into The Only Camping Stove You\'ll Ever Need',
    link: 'https://vimeo.com/tomallen/beer-can-stove',
    duration: 'PT7M59S',
    description: 'One of the best gifts I\'ve ever received on my travels is a stove made with nothing but a drinks can and a knife. In this video, we\'re going to learn how to make it.\n\nThe stove runs on alcohol, of which the most common source is medical alcohol from your local pharmacy. For information on finding fuel for the stove, visit http://zenstoves.net/Stoves.htm#Fuels\n\nIt goes without saying that fire can be dangerous. Be respectful and enjoy putting this stove to good use!\n\nhttp://tomsbiketrip.com',
    user: 'Tom Allen',
    user_link: 'https://vimeo.com/tomallen',
    created_time: '2013-04-24T14:03:00+00:00',
    release_time: '2013-04-24T14:03:00+00:00',
    dimensions: '1280 x 720',
    thumbnail: 'https://i.vimeocdn.com/video/435491329_1280x720.jpg'
  },
  {
    name: 'Hi Stranger',
    link: 'https://vimeo.com/kirstenlepore/histranger',
    duration: 'PT2M42S',
    description: 'It\'s been a while...\n\nomg and there\'s merch here: https://society6.com/kirstenlepore\n\nWritten, Directed, and Animated by Kirsten Lepore\nVoice by Garrett Davis\nFinal Sound Mix by David Kamp\nThanks to:\nDan Kwan\nKent Osborne\nLate Night Work Club',
    user: 'Kirsten Lepore',
    user_link: 'https://vimeo.com/kirstenlepore',
    created_time: '2016-11-03T09:24:56+00:00',
    release_time: '2016-11-03T09:24:56+00:00',
    dimensions: '1920 x 1080',
    thumbnail: 'https://i.vimeocdn.com/video/624750928_1280x720.jpg'
  }
]

const test_vData_dm = [
  {
    title: 'How to Power an Entire Building with Internet',
    link: 'http://www.dailymotion.com/video/x6iiwdc',
    duration: 'PT2M38S',
    createdTime: '2018-04-27T14:43:25.000Z',
    dimensions: '1920 x 1080',
    poster: 'http://s2.dmcdn.net/qGnim.jpg'
  },
  {
    title: 'Profiles In Discourage: Foster Friess Says The Rich Should \'Self-Tax\'',
    link: 'http://www.dailymotion.com/video/x6ik7p2',
    duration: 'PT3M13S',
    createdTime: '2018-04-28T07:35:00.000Z',
    dimensions: '640 x 360',
    poster: 'http://s2.dmcdn.net/qHFqz.jpg'
  }
]

const test_vData_gd = [
  {
    title: 'YouTube - Big Buck Bunny animation (1080p HD).mp4',
    link: 'https://drive.google.com/file/d/0BxtaL881Sd6PUVFqR0RpZ1pvb1k',
    size: '159.85 MB',
    duration: 'PT9M56.458S',
    createdTime: '2014-06-11T09:44:54.745Z',
    dimensions: '1280 x 720'
  },
  {
    title: 'Poltergeist Trailer (2015).mp4',
    link: 'https://drive.google.com/file/d/0BwbYFkYi6CbSNlVzOEprRnV1ZXc',
    size: '25.34 MB',
    duration: 'PT2M41.168S',
    createdTime: '2015-02-06T17:00:45.373Z',
    dimensions: '1280 x 720'
  }
]

// Config test

test("Config - Should be null initially (Google Api key)", () => {
  expect(vLib.getGoogleApiKey()).toBeNull();
});

test("Config - Should be null initially (Vimeo Config)", () => {
  expect(vLib.getVimeoApiConfig()).toBeNull();
});

test("Config - Should get correct config data after setting (Google Api Key)", () => {
  expect(vLib.setGoogleApiKey(test_gApiKey)).toBe(test_gApiKey);
  expect(vLib.getGoogleApiKey()).toBe(test_gApiKey);
});

test("Config - Should get correct config data after setting (Vimeo Config)", () => {
  expect(vLib.setVimeoApiConfig(test_vConfig)).toBe(test_vConfig);
  expect(vLib.getVimeoApiConfig()).toBe(test_vConfig);
});

// Youtube test

test("Youtube - Get Single Video, check info", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.videoData("https://www.youtube.com/watch?v=jNQXAC9IVRw");
  expect(data).toEqual(test_vData_yt[0]);
});

test("Youtube - Get Single Video, check Info (Shortened URL)", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.videoData("https://youtu.be/jNQXAC9IVRw");
  expect(data).toEqual(test_vData_yt[0]);
})

test("Youtube - Get Array of Videos, check info", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.videoData(["https://youtu.be/jNQXAC9IVRw",
    "https://www.youtube.com/watch?v=rdwz7QiG0lk"]);
  expect(data).toEqual(test_vData_yt);
});

test("Youtube - Get Playlist Info Data, check info", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.playlistInfoData(
    "https://www.youtube.com/playlist?list=PL5vtqDuUM1DmXwYYAQcyUwtcalp_SesZD");
  expect(data).toEqual(test_pData_yt[0]);
});

test("Youtube - Get Array of Playlists' Info Data, check info", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.playlistInfoData([
    "https://www.youtube.com/playlist?list=PL5vtqDuUM1DmXwYYAQcyUwtcalp_SesZD",
    "https://www.youtube.com/playlist?list=PLbpi6ZahtOH4NWT2AIX4Z0ToNsjRxa02_"
  ]);
  expect(data).toEqual(test_pData_yt);
});

test("Youtube - Get Playlist Videos, check number of videos (>50)", async () => {
  expect.assertions(1);
  const data = await vLib.youtube.playlistVideoData(
    "https://www.youtube.com/watch?v=s0zqM6zHlZQ&list=PLbIc1971kgPAteN15QZf0dY1sAAX8qqvU");
  expect(data.length).toBeGreaterThanOrEqual(100);
});

// Google Drive Test

test("Google Drive - Get Single Video, check info", async () => {
  expect.assertions(1);
  const data = await vLib.gdrive.videoData(
    "https://drive.google.com/file/d/0BxtaL881Sd6PUVFqR0RpZ1pvb1k");
  delete data.thumbnail;
  expect(data).toEqual(test_vData_gd[0]);
});

test("Google Drive - Get Single Video, check info (Different Links types)", async () => {
  expect.assertions(3);
  const data1 = await vLib.gdrive.videoData("https://drive.google.com/file/d/0BwbYFkYi6CbSNlVzOEprRnV1ZXc/preview");
  const data2 = await vLib.gdrive.videoData("https://docs.google.com/file/d/0BwbYFkYi6CbSNlVzOEprRnV1ZXc");
  const data3 = await vLib.gdrive.videoData("https://drive.google.com/open?id=0BwbYFkYi6CbSNlVzOEprRnV1ZXc");
  delete data1.thumbnail;
  delete data2.thumbnail;
  delete data3.thumbnail;
  expect(data1).toEqual(test_vData_gd[1]);
  expect(data2).toEqual(test_vData_gd[1]);
  expect(data3).toEqual(test_vData_gd[1]);
});

test("Google Drive - Get Array of Videos, check info", async () => {
  expect.assertions(1);
  const data = await vLib.gdrive.videoData([
    "https://drive.google.com/file/d/0BxtaL881Sd6PUVFqR0RpZ1pvb1k",
    "https://drive.google.com/file/d/0BwbYFkYi6CbSNlVzOEprRnV1ZXc"
  ]);
  delete data[0].thumbnail;
  delete data[1].thumbnail;
  expect(data).toEqual(test_vData_gd);
})

// Vimeo Test

test("Vimeo - Get Single Video, check info", async () => {
  expect.assertions(1);
  const data = await vLib.vimeo.videoData("https://vimeo.com/64726512")
  expect(data).toEqual(test_vData_vm[0]);
})

test("Vimeo - Get Array of Videos, check info", async () => {
  expect.assertions(1);
  const data = await vLib.vimeo.videoData([
    "https://vimeo.com/64726512", "https://vimeo.com/190063150"]);
  expect(data).toEqual(test_vData_vm);
})

// Dailymotion Test

test("Dailymotion - Get Single Video, check info", async () => {
  expect.assertions(1);
  const data = await vLib.dailymotion.videoData("http://www.dailymotion.com/video/x6iiwdc");
  expect(data).toEqual(test_vData_dm[0]);
})

test("Dailymotion - Get Single Video, check info (Shortened URL)", async () => {
  expect.assertions(1);
  const data = await vLib.dailymotion.videoData("http://dai.ly/x6iiwdc");
  expect(data).toEqual(test_vData_dm[0]);
})

test("Dailymotion - Get Array of Videos, check info", async () => {
  expect.assertions(1);
  const data = await vLib.dailymotion.videoData(["http://dai.ly/x6iiwdc",
    "http://www.dailymotion.com/video/x6ik7p2"]);
  expect(data).toEqual(test_vData_dm);
})



