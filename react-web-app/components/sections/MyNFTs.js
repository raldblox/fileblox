import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTContract from "./contracts/NFT.sol";
import FileRegistry from "./contracts/FileRegistry.sol";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

const MyTokens = () => {
  const [provider, setProvider] = useState(null);
  const [nftContract, setNFTContract] = useState(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's MetaMask accounts
          await window.ethereum.enable();

          // Create a new ethers provider using MetaMask's provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Get the network ID
          const network = await provider.getNetwork();

          // Get the contract address from the deployed contract
          const nftContractAddress = NFTContract.networks[network.chainId].address;

          // Create a new instance of the NFT contract
          const nftContract = new ethers.Contract(nftContractAddress, NFTContract.abi, provider.getSigner());
          setNFTContract(nftContract);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("Please install MetaMask to use this application.");
      }
    };

    initProvider();
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      if (nftContract) {
        try {
          // Get the tokens owned by the user
          const tokenIds = await nftContract.getTokensOwnedByMe();

          // Fetch token details for each token ID
          const tokenPromises = tokenIds.map(async (tokenId) => {
            const tokenUri = await nftContract.tokenURI(tokenId);
            const tokenMetadata = await fetch(tokenUri).then((response) => response.json());
            return {
              tokenId,
              fileName: tokenMetadata.name,
              fileId: tokenMetadata.fileId,
              filePrice: tokenMetadata.filePrice,
              uploader: tokenMetadata.uploader,
            };
          });

          // Wait for all token details to be fetched
          const fetchedTokens = await Promise.all(tokenPromises);

          // Set the state with the fetched tokens
          setTokens(fetchedTokens);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchTokens();
  }, [nftContract]);

  const decryptURL = async (url) => {
    handleNextStep(2);
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const decryptedURL = CryptoJS.AES.decrypt(url, encryptionKey).toString();
    return decryptedURL;
};

  const handleDownload = (fileId) => {
    // Implement the logic to download the file with the given fileId
    // You can use the file ID to retrieve the file from the server or IPFS, depending on your setup
    // For example:
    // const fileUrl = `https://your-file-server.com/files/${fileId}`;
    // window.open(fileUrl);
  };

  return (
    <div>
      <h1>My Tokens</h1>
      <table>
        <thead>
          <tr>
            <th>Token ID</th>
            <th>File Name</th>
            <th>File ID</th>
            <th>File Price</th>
            <th>Uploader</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.tokenId}>
              <td>{token.tokenId}</td>
              <td>{token.fileName}</td>
              <td>{token.fileId}</td>
              <td>{token.filePrice}</td>
              <td>{token.uploader}</td>
              <td>
                <button onClick={() => handleDownload(token.fileId)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyTokens;
