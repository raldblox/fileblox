import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import nftAbi from "/libraries/contractABIs/FileToken.json";
import { goerli } from "@/libraries/contractAddresses";

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

          // Create a new instance of the NFT contract
          const nftContract = new ethers.Contract(goerli.Token, nftAbi, provider.getSigner());
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
          console.log(nftContract)
          // Get the tokens owned by the user
          const tokenIds = await nftContract.getTokensOwnedByMe();
          console.log(tokenIds)


          // Fetch token details for each token ID
          const tokenPromises = tokenIds.map(async (tokenId) => {
            const tokenUri = await nftContract.tokenURI(tokenId);
            const base64String = tokenUri.split(',')[1]; // Extract the base64-encoded string from the URI
            let jsonString;

            if (typeof window !== 'undefined' && typeof window.atob === 'function') {
              jsonString = window.atob(base64String); // Decode using window.atob in the browser
            } else {
              const buffer = Buffer.from(base64String, 'base64'); // Decode using Buffer in Node.js
              jsonString = buffer.toString('utf-8');
            }

            const tokenMetadata = JSON.parse(jsonString);
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
      <div className="mt-12 relative h-max overflow-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 pr-6">Token ID</th>
              <th className="py-3 pr-6">File Name</th>
              <th className="py-3 pr-6">File Size</th>
              <th className="py-3 pr-6">File ID</th>
              <th className="py-3 pr-6">Price</th>
              <th className="py-3 pr-6">Uploader</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {
              tokens.map((item, idx) => (
                <tr key={idx}>
                  <td className="pr-6 py-4 whitespace-nowrap">{item.tokenID}</td>
                  <td className="pr-6 py-4 whitespace-nowrap">{item.fileName}</td>
                  <td className="pr-6 py-4 whitespace-nowrap">{item.size}KB</td>
                  <td className="pr-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                      {item.FileId}
                    </span>
                  </td>

                  <td className="pr-6 py-4 whitespace-nowrap">{item.price}$APE</td>
                  <td className="pr-6 py-4 whitespace-nowrap">{item.uploader}</td>
                  <td className="text-right whitespace-nowrap">
                    <button onClick={handleDownload(item.fileId)} className="py-1.5 px-3 text-gray-600 hover:text-gray-500 duration-150 hover:bg-gray-50 border rounded-lg">
                      Download
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTokens;
