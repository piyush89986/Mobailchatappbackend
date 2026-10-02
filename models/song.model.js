import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
    },
    album: {
      type: String,
      default: 'Single',
      trim: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 180, // duration in seconds
    },
    genre: {
      type: String,
      default: 'Pop',
    },
    tags: [
      {
        type: String,
      },
    ],
    playsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

const songModel = mongoose.model('Song', songSchema);
export default songModel;
