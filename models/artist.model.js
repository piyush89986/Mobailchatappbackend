import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    monthlyListeners: {
      type: String,
      default: '1.2M',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const artistModel = mongoose.model('Artist', artistSchema);
export default artistModel;
