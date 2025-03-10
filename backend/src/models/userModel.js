const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    wallets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check if entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comment out mock User model
/*
const User = {
  findById: (id) => {
    // Mock user data
    return Promise.resolve({
      _id: id,
      username: 'testuser',
      email: 'test@example.com',
      isAdmin: false,
      wallets: ['wallet1', 'wallet2'],
    });
  },
  findOne: ({ email }) => {
    // Mock user data
    if (email === 'test@example.com') {
      return Promise.resolve({
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$X9xYmQFrAMFYBJX8hzLWz.3hR7Ol5SBGLdBr9GdSzKyR5vEQFzZFy', // 'password123'
        isAdmin: false,
        wallets: ['wallet1', 'wallet2'],
        matchPassword: async (enteredPassword) => {
          return enteredPassword === 'password123';
        },
      });
    }
    return Promise.resolve(null);
  },
  create: (userData) => {
    // Mock user creation
    return Promise.resolve({
      _id: Math.random().toString(36).substring(7),
      ...userData,
      password: 'hashed_password',
    });
  },
};
*/

// Use real mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;
