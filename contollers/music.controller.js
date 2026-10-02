import songModel from '../models/song.model.js';
import artistModel from '../models/artist.model.js';
import playlistModel from '../models/playlist.model.js';
import userMusicDataModel from '../models/userMusicData.model.js';

// Reliable streamable high-quality CDN audio tracks for instant playback
const INITIAL_ARTISTS = [
  {
    name: 'Arpit Bala',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
    bio: 'Indian singer-songwriter and producer known for experimental indie hip-hop.',
    monthlyListeners: '1,428,910',
  },
  {
    name: 'Karan Aujla',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    bio: 'Punjabi singer, lyricist and rapper known worldwide.',
    monthlyListeners: '9,812,400',
  },
  {
    name: 'Seedhe Maut',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
    bio: 'Pioneering Delhi hip-hop duo consisting of Calm and Encore ABJ.',
    monthlyListeners: '2,950,120',
  },
  {
    name: 'DIVINE',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1000&auto=format&fit=crop&q=80',
    bio: 'Gully Gang representative and Indian hip-hop icon.',
    monthlyListeners: '4,100,500',
  },
  {
    name: 'King',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    bio: 'Chart-topping Indian pop and rap sensation.',
    monthlyListeners: '6,200,000',
  },
  {
    name: 'Pink Sweat$',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    bio: 'American singer and songwriter known for soulful acoustic R&B.',
    monthlyListeners: '12,500,000',
  },
  {
    name: 'Arijit Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1000&auto=format&fit=crop&q=80',
    bio: 'The voice of modern Indian cinema with global appeal.',
    monthlyListeners: '42,000,000',
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
    const existingSongsCount = await songModel.countDocuments();
    if (existingSongsCount >= 8) {
      return;
    }

    console.log('[Music Seed]: Seeding artists and songs catalog...');

    // Seed Artists
    const artistMap = {};
    for (const art of INITIAL_ARTISTS) {
      const doc = await artistModel.findOneAndUpdate(
        { name: art.name },
        { $setOnInsert: art },
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
    console.log('[Music Seed]: Music catalog successfully populated!');
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
    const allSongs = await songModel.find().sort({ playsCount: -1 }).limit(20);
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
    const jumpBackIn = allSongs.slice(0, 8);

    // Recommended for today
    const recommended = allSongs.slice(4, 12);

    return res.status(200).json({
      quickGrid,
      jumpBackIn,
      recommended,
      artists,
      userLikedCount: userMusic.likedSongs.length,
    });
  } catch (error) {
    console.error('getHomeMusicFeed Error:', error);
    return res.status(500).json({ message: error.message });
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

    const songs = await songModel.find(filter).limit(30);
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

    const artist = await artistModel.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const isFollowing = artist.followers?.some((u) => u.toString() === userId.toString());
    const topSongs = await songModel.find({ artist: new RegExp(artist.name, 'i') }).sort({ playsCount: -1 }).limit(15);

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
