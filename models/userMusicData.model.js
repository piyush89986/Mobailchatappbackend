import mongoose from 'mongoose';

const userMusicDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    likedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    followedArtists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
    recentlyPlayed: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Song',
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const userMusicDataModel = mongoose.model('UserMusicData', userMusicDataSchema);
export default userMusicDataModel;
