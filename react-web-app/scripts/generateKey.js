const axios = require("axios");

const generateRandomKey = async () => {
  try {
    // Fetch randomness from drand API
    const response = await axios.get("https://api.drand.sh/public/latest");
    const { randomness } = response.data;

    // Convert the randomness to a hexadecimal string
    const randomKey = Buffer.from(randomness, "base64").toString("hex");

    return randomKey;
  } catch (error) {
    console.error("Error generating random key:", error);
    process.exit(1);
  }
};

// Generate and print the random key
generateRandomKey()
  .then((randomKey) => {
    console.log("Random Key:", randomKey);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

//   Run the script using Node.js by executing the following command:
//   node scripts/generateKey.js
