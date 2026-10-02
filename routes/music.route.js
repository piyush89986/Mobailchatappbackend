import express from 'express';
import {
  getHomeMusicFeed,
  searchMusic,
  getLikedSongs,
  toggleLikeSong,
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getArtistDetails,
  toggleFollowArtist,
  getUserLibrary,
  autoSeedCatalog,
} from '../contollers/music.controller.js';
import { authMiddlewareOnlyForUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public / seed check route
router.post('/seed', async (req, res) => {
  try {
    await autoSeedCatalog();
    res.status(200).json({ message: 'Catalog seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected routes
router.use(authMiddlewareOnlyForUser);

// Home feed
router.get('/home', getHomeMusicFeed);

// Search
router.get('/search', searchMusic);

// Library & Liked songs
router.get('/library', getUserLibrary);
router.get('/liked', getLikedSongs);
router.post('/songs/:songId/like', toggleLikeSong);

// Playlists
router.get('/playlists', getUserPlaylists);
router.post('/playlists', createPlaylist);
router.get('/playlists/:id', getPlaylistById);
router.post('/playlists/:id/songs', addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', removeSongFromPlaylist);

// Artists
router.get('/artists/:id', getArtistDetails);
router.post('/artists/:id/follow', toggleFollowArtist);

export default router;
