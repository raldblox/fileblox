import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { mumbai } from "@/libraries/contractAddresses";
import registryAbi from "/libraries/contractABIs/FileRegistry.json";

const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS;

const LatestFiles = ({ type }) => {
  const [provider, setProvider] = useState(null);
  const [fileRegistry, setFileRegistry] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's MetaMask accounts
          await window.ethereum.enable();

          // Create a new ethers provider using MetaMask's provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Create a new instance of the contract
          const fileRegistry = new ethers.Contract(mumbai.Registry, registryAbi, provider.getSigner());
          setFileRegistry(fileRegistry);
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
    const fetchLatestFiles = async () => {
      if (fileRegistry) {
        try {
          // Call the smart contract to get the latest recorded files for "graphics" file type
          const fileIds = await fileRegistry.getAvailableFilesByType(type);

          // Sort file IDs by the latest recorded files and take only the first four
          const sortedFileIds = fileIds.sort((a, b) => b - a).slice(0, 4);

          // Fetch file details for the four most recent file IDs
          const filePromises = sortedFileIds.map(async (fileId) => {
            const fileData = await fileRegistry.getFileDataByFileID(fileId);

            return {
              fileId: fileId,
              filePath: fileData[0],
              fileSize: fileData[1].toNumber(),
              filePrice: fileData[2].toNumber(),
              fileType: fileData[3],
              fileName: fileData[4],
              fileDescription: fileData[5],
              uploader: fileData[6],
              isBannedByMod: fileData[7],
              isDelistedByOwner: fileData[8],
            };
          });

          console.log(filePromises);

          // Wait for all file details to be fetched
          const fetchedFiles = await Promise.all(filePromises);

          // Set the state with the fetched files
          setFiles(fetchedFiles);

        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchLatestFiles();
  }, [fileRegistry]);

  const handleMintNFT = async (fileId, quantity) => {
    try {
      // Check if the provider and fileRegistry instances are set
      if (provider && fileRegistry) {

        // Prompt the user to pay for the file and mint NFT with the specified quantity
        const transaction = await fileRegistry.payForFile(fileId, quantity);
        await transaction.wait();
        console.log(`${quantity} file(s) minted successfully`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCheckDetails = (fileId) => {
    // Set the selected file to be displayed in the modal
    const selectedFile = files.find((file) => file.fileId === fileId);
    setSelectedFile(selectedFile);
    // Open the modal
    openModal();
  };

  const FileDetailsModal = ({ selectedFile, onClose }) => {
    return (
      <div className="absolute bg-black">
        <div className="modal-content">
          <h2 className="text-gray-800 text-3xl font-semibold sm:text-4xl">File Details</h2>
          {selectedFile && (
            <>
              <p>File ID: {selectedFile.fileId}</p>
              <p>File Name: {selectedFile.fileName}</p>
              <p>File Type: {selectedFile.fileType}</p>
              <p>File Price: {selectedFile.filePrice}</p>
              <p>File Description: {selectedFile.fileDescription}</p>
              <p>Uploader: {selectedFile.uploader}</p>
            </>
          )}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <section className="mx-auto px-4 w-full md:px-8 items-start justify-start md:flex">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {files ? (
          files.map((item, key) => (
            <li className="border rounded-lg" key={key}>
              <div className="flex items-start justify-between p-4 gap-4">
                <div className="space-y-2">
                  {item.icon}
                  <h4 className="text-gray-800 font-semibold">File Name: {item.fileName}</h4>
                  <p className="text-gray-600 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {item.filePrice} $APE</p>
                </div>
                <button onClick={() => handleMintNFT(item.fileId)} className="text-gray-700 text-sm border rounded-lg px-3 py-2 duration-150 hover:bg-gray-100">Mint NFT</button>
              </div>
              <div className="py-5 px-4 border-t text-right">
                <button onClick={() => handleCheckDetails(item.fileId.toNumber())} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  Check Details
                </button>
              </div>
            </li>
          ))) :
          <div>Loading...</div>
        }
      </ul>
      {isModalOpen && (
        <FileDetailsModal selectedFile={selectedFile} onClose={closeModal} />
      )}
    </section>
  );
};

export default LatestFiles;
