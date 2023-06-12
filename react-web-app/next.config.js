require('dotenv').config();

module.exports = {
  reactStrictMode: true,
  env: {
    NFTSTORAGE_API_KEY: process.env.NFTSTORAGE_API_KEY,
    SECRET: process.env.SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
  },
};
