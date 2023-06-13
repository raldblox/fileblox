import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { mumbai } from "@/libraries/contractAddresses";
import registryAbi from "/libraries/contractABIs/FileRegistry.json";

const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS; 

const GraphicsFiles = () => {
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

          // Get the network ID
          const network = await provider.getNetwork();

          // Get the contract ABI
          const contractAbi = FileRegistryContract.abi;

          // Get the contract address from the deployed contract
          const contractAddress = FileRegistryContract.networks[network.chainId].address;

          // Create a new instance of the contract
          const fileRegistry = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
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
    const fetchGraphicsFiles = async () => {
      if (fileRegistry) {
        try {
          // Call the smart contract to get the latest recorded files for "graphics" file type
          const fileIds = await fileRegistry.getAvailableFilesByType('graphics');
    
          // Sort file IDs by the latest recorded files and take only the first four
          const sortedFileIds = fileIds.sort((a, b) => b - a).slice(0, 4);

          // Fetch file details for the four most recent file IDs
          const filePromises = sortedFileIds.map(async (fileId) => {
          const fileData = await fileRegistry.getFileDataByFileID(fileId);
            return {
              fileId: fileData[0],
              filePath: fileData[1],
              fileSize: fileData[2],
              filePrice: fileData[3],
              fileType: fileData[4],
              fileName: fileData[5],
              fileDescription: fileData[6],
              uploader: fileData[7],
              isBannedByMod: fileData[8],
              isDelistedByOwner: fileData[9],
            };
          });

          // Wait for all file details to be fetched
          const fetchedFiles = await Promise.all(filePromises);

          // Set the state with the fetched files
          setFiles(fetchedFiles);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchGraphicsFiles();
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
      <div className="modal">
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
  <section className="py-14 bg-orange-50">
  <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
    <h1 className="text-gray-800 text-3xl font-semibold sm:text-4xl">Graphics Files</h1>
    {files.map((file) => (
      <div key={file.fileId}>
        <img src={file.filePath} alt="File Cover" />
        <h2>{file.fileName}</h2>
        <p>Price: {file.filePrice}</p>
        <button onClick={() => handleMintNFT(file.fileId)}>Mint NFT</button>
        <button onClick={() => handleCheckDetails(file.fileId)}>Check Details</button>
      </div>
    ))}
    {isModalOpen && (
      <FileDetailsModal selectedFile={selectedFile} onClose={closeModal} />
    )}
  </div>
  </section>
  );
};

export default GraphicsFiles;
