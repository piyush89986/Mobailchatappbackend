import songModel from '../models/song.model.js';
import artistModel from '../models/artist.model.js';
import playlistModel from '../models/playlist.model.js';
import userMusicDataModel from '../models/userMusicData.model.js';
import CryptoJS from 'crypto-js';
import { uploadToCloudinary } from '../config/cloudinary.config.js';

// Decrypt JioSaavn media URL (DES-ECB with key '38346591')
export function decryptMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl) return null;
    return rawUrl.replace('_96.mp4', '_160.mp4');
  } catch (e) {
    return null;
  }
}

// Fetch real songs from JioSaavn API
export async function fetchJioSaavnSongs(query, limit = 20) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&ctx=web6dot0&api_version=4&n=${limit}&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const data = await res.json();
    const results = data.results || [];
    return results
      .map((s) => {
        const audioUrl = decryptMediaUrl(s.more_info?.encrypted_media_url);
        if (!audioUrl) return null;

        const rawTitle = (s.title || '')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&');
        const artist =
          s.more_info?.artistMap?.primary_artists?.map((a) => a.name).join(', ') ||
          s.subtitle ||
          'Various Artists';
        const coverUrl = (s.image || '')
          .replace('150x150', '500x500')
          .replace('http://', 'https://');

        return {
          title: rawTitle,
          artist,
          album: s.more_info?.album || 'Single',
          coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          audioUrl,
          duration: parseInt(s.more_info?.duration || '180', 10),
          genre: s.language ? s.language.charAt(0).toUpperCase() + s.language.slice(1) : 'Pop',
          tags: [s.language || 'Music', 'Trending'],
          playsCount: parseInt(s.play_count || '100000', 10),
          likesCount: Math.floor(parseInt(s.play_count || '100000', 10) * 0.08),
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error('Error fetching JioSaavn songs:', err.message);
    return [];
  }
}

// India's top superstar artists with high-resolution portraits
const POPULAR_ARTISTS = [
  {
    name: 'Arijit Singh',
    avatarUrl: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1000&auto=format&fit=crop&q=80',
    bio: 'The undisputed voice of modern Bollywood romance with millions of global fans.',
    monthlyListeners: '42,850,200',
  },
  {
    name: 'Karan Aujla',
    avatarUrl: 'https://c.saavncdn.com/artists/Karan_Aujla_006_20240905063051_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    bio: 'Global Punjabi music powerhouse behind Making Memories, Tauba Tauba and Street Dreams.',
    monthlyListeners: '15,400,000',
  },
  {
    name: 'Diljit Dosanjh',
    avatarUrl: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20240417072045_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    bio: 'International superstar, Coachella performer, actor, and chart-topping singer.',
    monthlyListeners: '22,100,000',
  },
  {
    name: 'Sidhu Moosewala',
    avatarUrl: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_005_20230608074819_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
    bio: 'Legendary Punjabi rapper and global icon known for 295, The Last Ride and Moosetape.',
    monthlyListeners: '18,900,000',
  },
  {
    name: 'Shreya Ghoshal',
    avatarUrl: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_005_20241004071850_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
    bio: 'One of the most celebrated and melodious playback singers in Indian history.',
    monthlyListeners: '28,600,000',
  },
  {
    name: 'AP Dhillon',
    avatarUrl: 'https://c.saavncdn.com/artists/AP_Dhillon_003_20231120074351_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1000&auto=format&fit=crop&q=80',
    bio: 'Brown Munde pioneer blending Punjabi vocals with Western trap and synth-pop.',
    monthlyListeners: '11,200,000',
  },
  {
    name: 'Anuv Jain',
    avatarUrl: 'https://c.saavncdn.com/artists/Anuv_Jain_003_20231120073837_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=80',
    bio: 'Independent indie singer-songwriter behind Husn, Baarishein and Alag Aasmaan.',
    monthlyListeners: '9,800,000',
  },
  {
    name: 'Badshah',
    avatarUrl: 'https://c.saavncdn.com/artists/Badshah_005_20230608074911_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&auto=format&fit=crop&q=80',
    bio: 'India’s biggest commercial rap and party anthem creator.',
    monthlyListeners: '19,500,000',
  },
  {
    name: 'Pritam',
    avatarUrl: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    bio: 'Hit-making composer behind Brahmastra, Yeh Jawaani Hai Deewani and Ae Dil Hai Mushkil.',
    monthlyListeners: '35,000,000',
  },
  {
    name: 'The Weeknd',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    bio: 'Global pop, R&B and synth-wave superstar behind Blinding Lights and Starboy.',
    monthlyListeners: '105,000,000',
  },
];

// Top Trending Albums matching Spotify
const TRENDING_ALBUMS = [
  {
    id: 'album-aashiqui-2',
    title: 'Aashiqui 2',
    artist: 'Mithoon, Ankit Tiwari, Jeet Gannguli',
    coverUrl: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg',
    year: '2013',
    genre: 'Bollywood Romance',
    searchQuery: 'Aashiqui 2',
  },
  {
    id: 'album-brahmastra',
    title: 'Brahmastra',
    artist: 'Pritam, Arijit Singh',
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    year: '2022',
    genre: 'Bollywood Soundtrack',
    searchQuery: 'Brahmastra',
  },
  {
    id: 'album-making-memories',
    title: 'Making Memories',
    artist: 'Karan Aujla, Ikky',
    coverUrl: 'https://c.saavncdn.com/264/Making-Memories-Punjabi-2023-20230818063001-500x500.jpg',
    year: '2023',
    genre: 'Punjabi',
    searchQuery: 'Making Memories Karan Aujla',
  },
  {
    id: 'album-animal',
    title: 'Animal',
    artist: 'Pritam, Vishal Mishra, Manan Bhardwaj',
    coverUrl: 'https://c.saavncdn.com/092/Animal-Hindi-2023-20231124191036-500x500.jpg',
    year: '2023',
    genre: 'Bollywood',
    searchQuery: 'Animal Ranbir Kapoor',
  },
  {
    id: 'album-glory',
    title: 'Glory',
    artist: 'Yo Yo Honey Singh',
    coverUrl: 'https://c.saavncdn.com/832/GLORY-Hindi-2024-20240826182512-500x500.jpg',
    year: '2024',
    genre: 'Hip-Hop / Rap',
    searchQuery: 'Glory Honey Singh',
  },
  {
    id: 'album-kabir-singh',
    title: 'Kabir Singh',
    artist: 'Sachet-Parampara, Mithoon',
    coverUrl: 'https://c.saavncdn.com/352/Kabir-Singh-Hindi-2019-20240314141641-500x500.jpg',
    year: '2019',
    genre: 'Bollywood Romance',
    searchQuery: 'Kabir Singh',
  },
  {
    id: 'album-ghost',
    title: 'Ghost',
    artist: 'Diljit Dosanjh',
    coverUrl: 'https://c.saavncdn.com/498/Ghost-Punjabi-2023-20230929053033-500x500.jpg',
    year: '2023',
    genre: 'Punjabi Pop',
    searchQuery: 'Ghost Diljit Dosanjh',
  },
  {
    id: 'album-moosetape',
    title: 'Moosetape',
    artist: 'Sidhu Moosewala',
    coverUrl: 'https://c.saavncdn.com/978/Moosetape-Punjabi-2021-20210514120305-500x500.jpg',
    year: '2021',
    genre: 'Punjabi Hip-Hop',
    searchQuery: 'Moosetape Sidhu',
  },
  {
    id: 'album-yjhd',
    title: 'Yeh Jawaani Hai Deewani',
    artist: 'Pritam',
    coverUrl: 'https://c.saavncdn.com/911/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.jpg',
    year: '2013',
    genre: 'Bollywood',
    searchQuery: 'Yeh Jawaani Hai Deewani',
  },
  {
    id: 'album-starboy',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    coverUrl: 'https://c.saavncdn.com/791/Starboy-English-2016-500x500.jpg',
    year: '2016',
    genre: 'R&B / Pop',
    searchQuery: 'Starboy The Weeknd',
  },
];

// Top Curated Featured Playlists / Charts
const FEATURED_CHARTS = [
  {
    id: 'chart-top-50',
    title: 'Today’s Top Hits',
    subtitle: 'The hottest tracks in India right now',
    coverUrl: 'https://c.saavncdn.com/editorial/Today_sTopHits_20240812070403_500x500.jpg',
    searchQuery: 'Top Songs 2024',
  },
  {
    id: 'chart-bollywood-romance',
    title: 'Bollywood Romance',
    subtitle: 'Soulful love hits by Arijit & Shreya',
    coverUrl: 'https://c.saavncdn.com/editorial/RomanticHitsHindi_20240226083414_500x500.jpg',
    searchQuery: 'Bollywood Love Songs',
  },
  {
    id: 'chart-punjabi-heat',
    title: 'Punjabi 101',
    subtitle: 'Karan Aujla, Diljit, AP Dhillon, Sidhu',
    coverUrl: 'https://c.saavncdn.com/editorial/Punjabi101_20240812070403_500x500.jpg',
    searchQuery: 'Punjabi Hits Karan Aujla',
  },
  {
    id: 'chart-lofi-chill',
    title: 'Late Night Lo-Fi',
    subtitle: 'Soft acoustic melodies & midnight chill',
    coverUrl: 'https://c.saavncdn.com/editorial/LateNightLoFi_20240812070403_500x500.jpg',
    searchQuery: 'Lofi Hindi Chill',
  },
];

const INITIAL_SONGS = [
  {
    title: 'Rakhlo Tum Chupaake',
    artist: 'Arpit Bala, Adil',
    album: 'Single',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372,
    genre: 'Indie',
    tags: ['Slow', 'Mellow', 'Quiet', 'Love'],
    playsCount: 452000,
    likesCount: 38200,
  },
  {
    title: 'At My Worst (Gustixa Remix)',
    artist: 'Pink Sweat$, Gustixa',
    album: 'The Prelude',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 215,
    genre: 'R&B / Pop',
    tags: ['Love', 'Soft', 'Romantic'],
    playsCount: 1250000,
    likesCount: 89000,
  },
  {
    title: 'Standing By You',
    artist: 'Nish',
    album: 'Standing By You - EP',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 198,
    genre: 'Acoustic',
    tags: ['Quiet', 'Peace', 'Soft'],
    playsCount: 310000,
    likesCount: 24500,
  },
  {
    title: 'Play Date / Main Tera (Medley)',
    artist: 'Arpit Bala, Adil',
    album: 'Lo-Fi Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 240,
    genre: 'Lo-Fi',
    tags: ['Soft', 'Slow', 'Peace'],
    playsCount: 820000,
    likesCount: 65000,
  },
  {
    title: 'Wakhra Swag',
    artist: 'Navv Inder, Badshah',
    album: 'Single',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 205,
    genre: 'Punjabi',
    tags: ['Party', 'Hype', 'Dance'],
    playsCount: 3400000,
    likesCount: 210000,
  },
  {
    title: 'Punya Paap',
    artist: 'DIVINE',
    album: 'Punya Paap',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 188,
    genre: 'Hip-Hop',
    tags: ['Hype', 'Rap', 'Gully'],
    playsCount: 2900000,
    likesCount: 195000,
  },
  {
    title: 'Darkhaast',
    artist: 'Mithoon, Arijit Singh, Sunidhi Chauhan',
    album: 'Shivaay',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 374,
    genre: 'Bollywood / Romantic',
    tags: ['Love', 'Slow', 'Romantic'],
    playsCount: 4200000,
    likesCount: 380000,
  },
  {
    title: 'Teri Meri Kahaani',
    artist: 'Palak Muchhal, Arijit Singh',
    album: 'Gabbar Is Back',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 331,
    genre: 'Romantic',
    tags: ['Love', 'Soft', 'Romantic'],
    playsCount: 5100000,
    likesCount: 410000,
  },
  {
    title: 'Kabhi Kabhi Aditi',
    artist: 'Rashid Ali',
    album: 'Jaane Tu Ya Jaane Na',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 221,
    genre: 'Pop / Nostalgia',
    tags: ['Happy', 'Feel Good', 'Peace'],
    playsCount: 1800000,
    likesCount: 140000,
  },
  {
    title: 'Haareya',
    artist: 'Sachin-Jigar, Arijit Singh',
    album: 'Meri Pyaari Bindu',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 214,
    genre: 'Romantic',
    tags: ['Love', 'Mellow', 'Soft'],
    playsCount: 2200000,
    likesCount: 180000,
  },
  {
    title: 'SHAKTI',
    artist: 'Seedhe Maut',
    album: 'Lunch Break',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    duration: 210,
    genre: 'Hip-Hop',
    tags: ['Hype', 'Rap'],
    playsCount: 1450000,
    likesCount: 120000,
  },
  {
    title: 'Listen to Me',
    artist: 'Karan Aujla',
    album: 'Four Me',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    duration: 175,
    genre: 'Punjabi',
    tags: ['Hype', 'Vibe'],
    playsCount: 3800000,
    likesCount: 290000,
  },
];

// Helper: Ensure initial catalog is seeded
export async function autoSeedCatalog() {
  try {
    // Automatically upgrade any legacy dummy soundhelix tracks with real JioSaavn streams
    const dummySongs = await songModel.find({ audioUrl: /soundhelix/ });
    if (dummySongs.length > 0) {
      console.log(`[Music Seed]: Upgrading ${dummySongs.length} dummy tracks to real JioSaavn audio...`);
      for (const d of dummySongs) {
        try {
          const realTracks = await fetchJioSaavnSongs(d.title, 1);
          if (realTracks && realTracks.length > 0) {
            d.audioUrl = realTracks[0].audioUrl;
            d.coverUrl = realTracks[0].coverUrl;
            d.duration = realTracks[0].duration;
            await d.save();
          }
        } catch (e) {
          // continue
        }
      }
    }

    const existingSongsCount = await songModel.countDocuments();
    if (existingSongsCount >= 20) {
      return;
    }

    console.log('[Music Seed]: Seeding artists and songs catalog...');

    // Seed popular artists
    const artistMap = {};
    for (const art of POPULAR_ARTISTS) {
      const doc = await artistModel.findOneAndUpdate(
        { name: art.name },
        { $set: art },
        { upsert: true, new: true }
      );
      artistMap[art.name] = doc._id;
    }

    // Seed Songs
    for (const s of INITIAL_SONGS) {
      // Look for matching primary artist
      let matchedArtistId = null;
      for (const artName of Object.keys(artistMap)) {
        if (s.artist.includes(artName)) {
          matchedArtistId = artistMap[artName];
          break;
        }
      }

      await songModel.findOneAndUpdate(
        { title: s.title, artist: s.artist },
        {
          $setOnInsert: {
            ...s,
            artistId: matchedArtistId,
          },
        },
        { upsert: true, new: true }
      );
    }
    // Also seed real trending songs from JioSaavn if needed
    const trendingQueries = ['Winning Speech', 'Kesariya', 'Husn Anuv Jain', 'Tauba Tauba Badshah', 'Softly Karan Aujla'];
    for (const tq of trendingQueries) {
      try {
        const saavnTracks = await fetchJioSaavnSongs(tq, 2);
        for (const trk of saavnTracks) {
          await songModel.findOneAndUpdate(
            { title: trk.title, artist: trk.artist },
            { $set: trk },
            { upsert: true, new: true }
          );
        }
      } catch (e) {
        // silent catch
      }
    }

    console.log('[Music Seed]: Music catalog successfully populated with real songs!');
  } catch (err) {
    console.error('[Music Seed Error]:', err.message);
  }
}

// 1. Home Feed API
export async function getHomeMusicFeed(req, res) {
  try {
    await autoSeedCatalog();
    const userId = req.user.id;

    // Fetch user music data
    let userMusic = await userMusicDataModel.findOne({ user: userId })
      .populate('likedSongs')
      .populate('followedArtists');

    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, likedSongs: [], followedArtists: [] });
    }

    // Fetch popular and recommended songs
    const allSongs = await songModel.find().sort({ playsCount: -1, createdAt: -1 }).limit(50);
    const artists = await artistModel.find().limit(10);
    const userPlaylists = await playlistModel.find({ creator: userId }).populate('songs');

    // Screenshot style: 2-column quick grid items (guarantee exactly 8 items)
    const quickGrid = [
      {
        id: 'liked-songs',
        type: 'liked',
        title: 'Liked Songs',
        subtitle: `${userMusic.likedSongs.length} songs`,
        coverUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
      },
      ...userPlaylists.map((pl) => ({
        id: pl._id,
        type: 'playlist',
        title: pl.name,
        subtitle: `Playlist • ${pl.songs.length} songs`,
        coverUrl: pl.coverUrl || (pl.songs[0]?.coverUrl) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      })),
      ...artists.map((art) => ({
        id: art._id,
        type: 'artist',
        title: art.name,
        subtitle: 'Artist',
        coverUrl: art.avatarUrl,
      })),
      ...allSongs.map((song) => ({
        id: song._id,
        type: 'song',
        title: song.title,
        subtitle: song.artist,
        coverUrl: song.coverUrl,
        songData: song,
      })),
    ].slice(0, 8);

    // Jump back in (Mix of recently played or top songs)
    const jumpBackIn = allSongs.slice(0, 15);

    // Recommended for today
    const recommended = allSongs.slice(5, 30);

    return res.status(200).json({
      quickGrid,
      jumpBackIn,
      popularArtists: artists,
      trendingAlbums: TRENDING_ALBUMS,
      featuredPlaylists: FEATURED_CHARTS,
      recommended,
      allSongs,
      userLikedCount: userMusic.likedSongs.length,
    });
  } catch (error) {
    console.error('getHomeMusicFeed Error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// 1.1 Collection / Album Songs API
export async function getCollectionSongs(req, res) {
  try {
    const { query, title } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    const tracks = await fetchJioSaavnSongs(query, 20);
    const saved = await Promise.all(
      tracks.map(async (t) => {
        return await songModel.findOneAndUpdate(
          { title: t.title, artist: t.artist },
          { $set: t },
          { upsert: true, new: true }
        );
      })
    );
    return res.status(200).json({
      title: title || query,
      songs: saved.filter(Boolean),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// 2. Search Music API
export async function searchMusic(req, res) {
  try {
    const { q, genre } = req.query;
    let filter = {};

    if (genre && genre !== 'All') {
      filter.genre = new RegExp(genre, 'i');
    }

    if (q && q.trim().length > 0) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ title: regex }, { artist: regex }, { album: regex }, { genre: regex }];
    }

    let songs = await songModel.find(filter).limit(30);

    // If query provided, also fetch real live songs from JioSaavn online catalog!
    if (q && q.trim().length > 1) {
      try {
        const saavnSongs = await fetchJioSaavnSongs(q.trim(), 20);
        if (saavnSongs && saavnSongs.length > 0) {
          // Upsert into DB so they have real Mongo ObjectIds for liking and playlists
          const savedSaavnSongs = await Promise.all(
            saavnSongs.map(async (item) => {
              try {
                return await songModel.findOneAndUpdate(
                  { title: item.title, artist: item.artist },
                  { $set: item },
                  { upsert: true, new: true }
                );
              } catch (e) {
                return null;
              }
            })
          );

          const validSaved = savedSaavnSongs.filter(Boolean);
          const existingIds = new Set(songs.map((s) => s._id.toString()));
          for (const s of validSaved) {
            if (!existingIds.has(s._id.toString())) {
              songs.push(s);
              existingIds.add(s._id.toString());
            }
          }
        }
      } catch (saavnErr) {
        console.error('JioSaavn search fetch error:', saavnErr.message);
      }
    }

    const artists = q
      ? await artistModel.find({ name: new RegExp(q.trim(), 'i') }).limit(10)
      : [];
    const playlists = q
      ? await playlistModel.find({ name: new RegExp(q.trim(), 'i'), isPublic: true }).limit(10)
      : [];

    return res.status(200).json({
      songs,
      artists,
      playlists,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 3. Liked Songs APIs
export async function getLikedSongs(req, res) {
  try {
    const userId = req.user.id;
    let userMusic = await userMusicDataModel.findOne({ user: userId }).populate('likedSongs');

    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, likedSongs: [] });
    }

    return res.status(200).json({
      songs: userMusic.likedSongs,
      totalCount: userMusic.likedSongs.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function toggleLikeSong(req, res) {
  try {
    const userId = req.user.id;
    const { songId } = req.params;

    let userMusic = await userMusicDataModel.findOne({ user: userId });
    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, likedSongs: [] });
    }

    const index = userMusic.likedSongs.findIndex((id) => id.toString() === songId);
    let isLiked = false;

    if (index > -1) {
      // Remove like
      userMusic.likedSongs.splice(index, 1);
      await songModel.findByIdAndUpdate(songId, { $inc: { likesCount: -1 } });
      isLiked = false;
    } else {
      // Add like
      userMusic.likedSongs.unshift(songId);
      await songModel.findByIdAndUpdate(songId, { $inc: { likesCount: 1 } });
      isLiked = true;
    }

    await userMusic.save();

    return res.status(200).json({
      success: true,
      isLiked,
      likedSongIds: userMusic.likedSongs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 4. Playlists APIs
export async function getUserPlaylists(req, res) {
  try {
    const userId = req.user.id;
    const playlists = await playlistModel.find({ creator: userId }).populate('songs').sort({ updatedAt: -1 });
    return res.status(200).json(playlists);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createPlaylist(req, res) {
  try {
    const userId = req.user.id;
    const { name, description, coverUrl, firstSongId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const newPlaylist = await playlistModel.create({
      name: name.trim(),
      description: description || '',
      coverUrl: coverUrl || '',
      creator: userId,
      songs: firstSongId ? [firstSongId] : [],
    });

    const populated = await playlistModel.findById(newPlaylist._id).populate('songs');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPlaylistById(req, res) {
  try {
    const { id } = req.params;
    const playlist = await playlistModel.findById(id).populate('creator', 'user_name avatar').populate('songs');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Calculate total duration
    const totalDurationSeconds = playlist.songs.reduce((acc, curr) => acc + (curr.duration || 180), 0);
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const durationFormatted = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;

    return res.status(200).json({
      playlist,
      durationFormatted,
      songCount: playlist.songs.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addSongToPlaylist(req, res) {
  try {
    const { id } = req.params; // playlistId
    const { songId } = req.body;

    const playlist = await playlistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    const updated = await playlistModel.findById(id).populate('songs');
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function removeSongFromPlaylist(req, res) {
  try {
    const { id, songId } = req.params;

    const playlist = await playlistModel.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
    await playlist.save();

    const updated = await playlistModel.findById(id).populate('songs');
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 5. Artist APIs
export async function getArtistDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let artist = null;
    try {
      artist = await artistModel.findById(id);
    } catch (e) {
      // not a valid ObjectId
    }
    if (!artist) {
      artist = await artistModel.findOne({ name: new RegExp(id, 'i') });
    }
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const isFollowing = artist.followers?.some((u) => u.toString() === userId.toString());
    let topSongs = await songModel.find({ artist: new RegExp(artist.name, 'i') }).sort({ playsCount: -1 }).limit(15);

    // If fewer than 8 songs, automatically fetch top tracks from JioSaavn!
    if (topSongs.length < 8) {
      try {
        const liveTracks = await fetchJioSaavnSongs(artist.name, 15);
        if (liveTracks && liveTracks.length > 0) {
          const savedTracks = await Promise.all(
            liveTracks.map(async (t) => {
              return await songModel.findOneAndUpdate(
                { title: t.title, artist: t.artist },
                { $set: { ...t, artistId: artist._id } },
                { upsert: true, new: true }
              );
            })
          );
          topSongs = savedTracks.filter(Boolean);
        }
      } catch (err) {
        // silent
      }
    }

    return res.status(200).json({
      artist,
      isFollowing: !!isFollowing,
      topSongs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function toggleFollowArtist(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const artist = await artistModel.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    let userMusic = await userMusicDataModel.findOne({ user: userId });
    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, followedArtists: [] });
    }

    const followerIndex = artist.followers.findIndex((f) => f.toString() === userId.toString());
    let isFollowing = false;

    if (followerIndex > -1) {
      artist.followers.splice(followerIndex, 1);
      userMusic.followedArtists = userMusic.followedArtists.filter((a) => a.toString() !== id.toString());
      isFollowing = false;
    } else {
      artist.followers.push(userId);
      if (!userMusic.followedArtists.includes(id)) {
        userMusic.followedArtists.push(id);
      }
      isFollowing = true;
    }

    await artist.save();
    await userMusic.save();

    return res.status(200).json({
      success: true,
      isFollowing,
      followersCount: artist.followers.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 6. User Library Summary API (Playlists + Liked + Followed Artists)
export async function getUserLibrary(req, res) {
  try {
    const userId = req.user.id;
    const userPlaylists = await playlistModel.find({ creator: userId }).populate('songs').sort({ updatedAt: -1 });

    let userMusic = await userMusicDataModel.findOne({ user: userId })
      .populate('likedSongs')
      .populate('followedArtists');

    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, likedSongs: [], followedArtists: [] });
    }

    return res.status(200).json({
      likedSongsCount: userMusic.likedSongs.length,
      playlists: userPlaylists,
      followedArtists: userMusic.followedArtists,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// 7. Upload Custom Song API
export async function uploadCustomSong(req, res) {
  try {
    const userId = req.user.id;
    const { title, artist, genre } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: 'Title and artist are required' });
    }

    const audioFile = req.files?.audio?.[0] || req.file;
    if (!audioFile) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    // 1. Upload audio to Cloudinary
    const audioUpload = await uploadToCloudinary(audioFile.path, 'fomo_music');
    const audioUrl = audioUpload ? audioUpload.url : `http://localhost:4100/${audioFile.path}`;

    // 2. Upload cover if provided
    let coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    const coverFile = req.files?.cover?.[0];
    if (coverFile) {
      const coverUpload = await uploadToCloudinary(coverFile.path, 'fomo_covers');
      if (coverUpload) {
        coverUrl = coverUpload.url;
      }
    }

    // 3. Create Song in MongoDB
    const song = await songModel.create({
      title: title.trim(),
      artist: artist.trim(),
      album: 'User Upload',
      coverUrl,
      audioUrl,
      duration: 180,
      genre: genre || 'Pop',
      tags: ['Custom Upload', 'User Music'],
      playsCount: 1,
      likesCount: 1,
    });

    // 4. Automatically add to user's liked songs
    let userMusic = await userMusicDataModel.findOne({ user: userId });
    if (!userMusic) {
      userMusic = await userMusicDataModel.create({ user: userId, likedSongs: [song._id], followedArtists: [] });
    } else {
      if (!userMusic.likedSongs.includes(song._id)) {
        userMusic.likedSongs.unshift(song._id);
        await userMusic.save();
      }
    }

    return res.status(201).json({
      message: 'Music uploaded successfully!',
      song,
    });
  } catch (error) {
    console.error('uploadCustomSong error:', error);
    return res.status(500).json({ message: error.message });
  }
}
