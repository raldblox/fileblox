import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import nftAbi from "/libraries/contractABIs/FileToken.json";
import { goerli } from "@/libraries/contractAddresses";
import { Context } from "@/context";
import Link from "next/link";

const index = () => {
    const { connectedWallet, connectWallet } = useContext(Context)
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [createdTokens, setCreatedTokens] = useState([]);

    const fetchTokens = async () => {
        const { ethereum } = window;
        if (ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const nftContract = new ethers.Contract(
                    goerli.Token,
                    nftAbi,
                    provider.getSigner()
                );

                // Get the tokens owned by the user
                const ownedTokens = await nftContract.getTokensOwnedByAddress(connectedWallet);
                const createdTokens = await nftContract.getTokensCreatedByAddress(connectedWallet);
                const tokenData = [...ownedTokens, ...createdTokens];

                // Fetch token details for each token ID
                const tokenPromises = tokenData.map(async (tokenId) => {
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

                // Separate ownedTokens and createdTokens
                const ownedTokensData = fetchedTokens.filter((token) => ownedTokens.includes(token.tokenId));
                const createdTokensData = fetchedTokens.filter((token) => createdTokens.includes(token.tokenId));

                // Set the state with the fetched tokens
                setOwnedTokens(ownedTokensData);
                setCreatedTokens(createdTokensData);
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        if (!connectedWallet) {
            connectWallet()
            return;
        }
        fetchTokens();
    }, [connectedWallet]);

    const handleDownload = async (fileId) => {
        try {
            // Fetch the token metadata for the file
            const tokenUri = await nftContract.tokenURI(fileId);
            const base64String = tokenUri.split(',')[1]; // Extract the base64-encoded string from the URI
            let jsonString;

            if (typeof window !== 'undefined' && typeof window.atob === 'function') {
                jsonString = window.atob(base64String); // Decode using window.atob in the browser
            } else {
                const buffer = Buffer.from(base64String, 'base64'); // Decode using Buffer in Node.js
                jsonString = buffer.toString('utf-8');
            }

            const tokenMetadata = JSON.parse(jsonString);

            // Decrypt the URL
            const encryptionKey = process.env.ENCRYPTION_KEY; // Replace with your encryption key
            const decryptedURL = CryptoJS.AES.decrypt(tokenMetadata.encryptedURL, encryptionKey).toString(CryptoJS.enc.Utf8);

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
                            <th className="py-3 pr-6">Uploader</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {
                            ownedTokens.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.tokenID}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.fileName}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.size}KB</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">
                                        <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                                            {item.FileId}
                                        </span>
                                    </td>

                                    <td className="py-4 pr-6 whitespace-nowrap">{item.price}$APE</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.uploader}</td>
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
                            <th className="py-3 pr-6">Uploader</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {
                            createdTokens.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.tokenID}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.fileName}</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.size}KB</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">
                                        <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                                            {item.FileId}
                                        </span>
                                    </td>

                                    <td className="py-4 pr-6 whitespace-nowrap">{item.price}$APE</td>
                                    <td className="py-4 pr-6 whitespace-nowrap">{item.uploader}</td>
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
