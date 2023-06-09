const path = require('path')
require('@nomiclabs/hardhat-waffle')
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require('dotenv').config({ path: path.join(__dirname, '/.env.local') })
require('hardhat-gas-reporter')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 5
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY, process.env.ACCOUNT2_PRIVATE_KEY],
      gas: 550000,
      gasPrice: 7000000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY, process.env.ACCOUNT2_PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
    },
    hyperspace: {
      chainId: 3141,
      url: "https://filecoin-hyperspace.chainup.net/rpc/v1",
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.API_POLYGONSCAN,
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
