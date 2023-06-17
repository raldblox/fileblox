import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import nftAbi from "/libraries/contractABIs/FileToken.json";
import registryAbi from "/libraries/contractABIs/FileRegistry.json";
import { goerli } from "@/libraries/contractAddresses";
import { Context } from "@/context";
import Link from "next/link";

const index = () => {
    const { connectedWallet, connectWallet } = useContext(Context)
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [createdTokens, setCreatedTokens] = useState([]);
    const [fileRegistryContract, setFileRegistryContract] = useState(null);

    const fetchTokens = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("Token: ", goerli.Token);
        const nftContract = new ethers.Contract(
            goerli.Token,
            nftAbi,
            provider.getSigner()
        );

        const fileRegistryContract = new ethers.Contract(
            goerli.Registry,
            registryAbi,
            provider.getSigner()
          );
          setFileRegistryContract(fileRegistryContract);

        const balance = await nftContract.balanceOf(connectedWallet);

        // Get the tokens owned by the user
        const ownedTokens = await nftContract.getTokensOwnedByAddress(connectedWallet);
        const createdTokens = await nftContract.getTokensCreatedByAddress(connectedWallet);
        const tokenData = [...new Set([...ownedTokens, ...createdTokens])];


        // Fetch token details for each token ID
        const tokenPromises = tokenData.map(async (tokenId) => {
            const tokenUri = await nftContract.tokenURI(tokenId);
            const fileId = await nftContract.getFileIdByTokenId(tokenId);
            const base64String = tokenUri.split(',')[1]; // Extract the base64-encoded string from the URI
            let jsonString;
            let filePrice;
            let fileSize;

            if (typeof window !== 'undefined' && typeof window.atob === 'function') {
                jsonString = window.atob(base64String); // Decode using window.atob in the browser
            } else {
                const buffer = Buffer.from(base64String, 'base64'); // Decode using Buffer in Node.js
                jsonString = buffer.toString('utf-8');
            }

            const tokenMetadata = JSON.parse(jsonString);

            // Check if the  attribute exists in the tokenMetadata
            if (tokenMetadata.attributes) {
                const filePriceAttribute = tokenMetadata.attributes.find(attribute => attribute.trait_type === "File Price");
                const fileSizeAttribute = tokenMetadata.attributes.find(attribute => attribute.trait_type === "File Size");
                if (filePriceAttribute) {
                    filePrice = filePriceAttribute.value;
                    fileSize = fileSizeAttribute.value;
                }
            }

            const filePriceFloat = filePrice ? parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(filePrice))) : 0;

            return {
                tokenId: tokenId,
                fileName: tokenMetadata.name,
                fileId: fileId,
                fileSize: fileSize || 0,
                filePrice: filePriceFloat,
            };
        });

        // Wait for all token details to be fetched
        const fetchedTokens = await Promise.all(tokenPromises);


        // Separate ownedTokens and createdTokens
        const ownedTokensData = fetchedTokens.filter((token) => ownedTokens.includes(token.tokenId));
        console.log("Owned", ownedTokensData)
        const createdTokensData = fetchedTokens.filter((token) => createdTokens.includes(token.tokenId));
        console.log("Created", createdTokensData)

        // Set the state with the fetched tokens
        setOwnedTokens(ownedTokensData);
        setCreatedTokens(createdTokensData);

    }

    useEffect(() => {
        if (connectedWallet) {
            fetchTokens();
        } else {
            connectWallet()
        }
    }, [connectedWallet]);

    const handleDownload = async (fileId) => {
        try {
            //Fetches filePath from fileId in the registry
            const fileData = await fileRegistryContract.getFileDataByFileID(fileId);
            const filePath = fileData[0];

            //Decrypts the filePath
            const decryptedURL = CryptoJS.AES.decrypt(
              filePath,
              process.env.ENCRYPTION_KEY
            ).toString(CryptoJS.enc.Utf8);

            // Initiate the file download
            const link = document.createElement('a');
            link.href = decryptedURL;
            link.setAttribute('download', ''); // Set the "download" attribute to force download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    return (
        <div className="max-w-screen-xl min-h-screen px-4 mx-auto md:px-8 py-14">
            <div className="items-start justify-between md:flex">
                <div className="max-w-lg">
                    <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Owned Tokens
                    </h3>
                </div>
                <div className="mt-3 md:mt-0">
                    <Link
                        href="/marketplace/upload"
                        className="inline-block px-4 py-2 font-medium text-white duration-150 bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-700 md:text-sm"
                    >
                        Upload file
                    </Link>
                </div>
            </div>
            <div className="mt-12 relative h-max overflow-auto min-h-[50vh]">
                <table className="w-full text-sm text-left table-auto">
                    <thead className="font-medium text-gray-600 border-b">
                        <tr>
                            <th className="py-3 pr-6">Token ID</th>
                            <th className="py-3 pr-6">File Name</th>
                            <th className="py-3 pr-6">File Size</th>
                            <th className="py-3 pr-6">File ID</th>
                            <th className="py-3 pr-6">Price</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {
                            ownedTokens.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.tokenId).toString()}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.fileName}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.fileSize).toString()} KB</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">
                                        <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                                            {Number(item.fileId).toString()}
                                        </span>
                                    </td>

                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.filePrice).toString()} $APE</td>
                                    <td className="text-right whitespace-nowrap">
                                        <button onClick={() => handleDownload(item.fileId)} className="py-1.5 px-3 text-gray-600 hover:text-gray-500 duration-150 hover:bg-gray-50 border rounded-lg">
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div className="items-start justify-between mt-10 md:flex ">
                <div className="max-w-lg">
                    <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Created Tokens
                    </h3>
                </div>
            </div>
            <div className="mt-12 relative h-max overflow-auto min-h-[50vh]">
                <table className="w-full text-sm text-left table-auto">
                    <thead className="font-medium text-gray-600 border-b">
                        <tr>
                            <th className="py-3 pr-6">Token ID</th>
                            <th className="py-3 pr-6">File Name</th>
                            <th className="py-3 pr-6">File Size</th>
                            <th className="py-3 pr-6">File ID</th>
                            <th className="py-3 pr-6">Price</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {
                            createdTokens.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.tokenId).toString()}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.fileName}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.fileSize).toString()} KB</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">
                                        <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                                            {Number(item.FileId).toString()}
                                        </span>
                                    </td>

                                    <td className="py-4 pr-6 whitespace-nowrap">{Number(item.filePrice).toString()} $APE</td>
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

export default index;
