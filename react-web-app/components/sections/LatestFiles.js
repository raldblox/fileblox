import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { mumbai } from "@/libraries/contractAddresses";
import registryAbi from "/libraries/contractABIs/FileRegistry.json";
import apeTokenAbi from "@/libraries/contractABIs/ApeToken.json";
import { Skeleton } from "@mui/material";

const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS;

const LatestFiles = ({ type }) => {
  const [provider, setProvider] = useState(null);
  const [fileRegistry, setFileRegistry] = useState(null);
  const [apeToken, setApeToken] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [qty, setQty] = useState(1);
  const [copyState, setCopyState] = useState(false)
  const URLLink = "https://fileblox.io/file"

  // Copy the link
  const handleCopy = () => {
    navigator.clipboard.writeText(URLLink).then(function () {
      setCopyState(true)
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  useEffect(() => {
    if (copyState) {
      setTimeout(() => setCopyState(false), 3000)
    }
  }, [copyState])

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Request access to the user's MetaMask accounts
          await window.ethereum.enable();

          // Create a new ethers provider using MetaMask's provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Create a new instance of the ApeToken contract
          const apeToken = new ethers.Contract(process.env.ERC20_ADDRESS, apeTokenAbi, signer);
          setApeToken(apeToken);

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
          setIsLoading(true);
          // Call the smart contract to get the latest recorded files for file type
          const fileIds = await fileRegistry.getAvailableFilesByType(type);

          // Convert BigNumber array to regular number array
          const fileIdsAsNumbers = fileIds.map((id) => id.toNumber());

          // Sort file IDs in reverse to see the latest recorded files
          const reversedFileIds = fileIdsAsNumbers.reverse();

          // Fetch file details for the four most recent file IDs
          const filePromises = reversedFileIds.map(async (fileId) => {
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
          // Wait for all file details to be fetched
          const fetchedFiles = await Promise.all(filePromises);

          console.log(`Fetched ${type}`, fetchedFiles);

          // Set the state with the fetched files
          setFiles(fetchedFiles);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
        }
      }
    };

    fetchLatestFiles();
  }, [fileRegistry]);

  const handleMintNFT = async () => {
    try {
      // Check if the provider, fileRegistry, and apeToken instances are set
      if (provider && fileRegistry && apeToken) {
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
        console.log(`Now minting ${qty} token/s for FileID ${selectedFile.fileId}`);
  
        // Calculate the total payment amount
        const totalPrice = qty * selectedFile.filePrice;
  
        // Check the Ape token balance of the user
        const balance = await apeToken.balanceOf(walletAddress);
        if (balance.lt(totalPrice)) {
          console.log("Insufficient Ape tokens");
          return;
        }
  
        // Prompt user to approve the fileRegistry contract to spend Ape tokens on his behalf
        const approvalTx = await apeToken.approve(fileRegistry.address, totalPrice);
        await approvalTx.wait();
  
        // Prompt the user to pay for the file and mint NFT with the specified quantity
        const transaction = await fileRegistry.payForFile(selectedFile.fileId, qty);
        await transaction.wait();
  
        console.log(`${qty} file(s) minted successfully`);
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

  const openMintModal = () => {
    setIsMintModalOpen(true);
  };

  const closeMintModal = () => {
    setIsMintModalOpen(false);
  };

  const handleCheckDetails = (fileId) => {
    // Set the selected file to be displayed in the modal
    console.log("Selected FileId:", fileId);
    const selectedFile = files.find((file) => file.fileId === fileId);
    console.log("Selected file:", selectedFile);
    setSelectedFile(selectedFile);
    // Open the modal
    openModal();
  };

  const FileDetailsModal = () => {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto mt-[20vh]">
          <div className="fixed inset-0 w-full h-full bg-black opacity-40" onClick={closeModal}></div>
          <div className="flex items-center min-h-[50vh] px-4 py-8">
            <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
              <div className="py-3 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800 sm:text-2xl">{selectedFile?.fileName}</h2>
                    <p className="text-[15px] text-gray-600 mt-4">
                      Description: {selectedFile?.fileDescription}
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 rounded-md hover:bg-gray-100"
                    onClick={closeModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid">
                  <p>File ID: {selectedFile?.fileId}</p>
                  <p>File Type: {selectedFile?.fileType}</p>
                  <p>File Price: {selectedFile?.filePrice}</p>
                  <p>Uploader: {selectedFile?.uploader}</p>
                </div>
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <p className="overflow-hidden text-sm text-gray-600">{URLLink}/{selectedFile?.fileId}</p>
                  <button className={`relative text-gray-500 ${copyState ? "text-orange-600 pointer-events-none" : ""}`}
                    onClick={handleCopy}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {
                      copyState ? (
                        <div className="absolute -top-12 -left-3 px-2 py-1.5 rounded-xl bg-orange-600 font-semibold text-white text-[10px] after:absolute after:inset-x-0 after:mx-auto after:top-[22px] after:w-2 after:h-2 after:bg-orange-600 after:rotate-45">Copied</div>
                      ) : ""
                    }
                  </button>
                </div>
                <button className="mt-2 py-2.5 px-8 flex-1 text-white bg-orange-600 rounded-md outline-none ring-offset-2 ring-orange-600 focus:ring-2"
                  onClick={closeModal}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleMintDetails = (fileId) => {
    // Set the selected file to be displayed in the modal
    console.log("Selected FileId:", fileId);
    const selectedFile = files.find((file) => file.fileId === fileId);
    console.log("Selected file:", selectedFile);
    setSelectedFile(selectedFile);
    // Open the modal
    openMintModal();
  };

  const MintNFTModal = () => {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto mt-[20vh]">
          <div className="fixed inset-0 w-full h-full bg-black opacity-40" onClick={closeMintModal}></div>
          <div className="flex items-center min-h-[50vh] px-4 py-8">
            <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
              <div className="py-3 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800 sm:text-2xl">Mint Token</h2>
                  </div>
                  <button className="p-2 text-gray-400 rounded-md hover:bg-gray-100"
                    onClick={closeMintModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="grid opacity-90">
                  <p>File ID: {selectedFile?.fileId}</p>
                  <p>File Name: {selectedFile?.fileName}</p>
                  <p>File Description: {selectedFile?.fileDescription}</p>
                  <p>Uploader: {selectedFile?.uploader}</p>
                  <p>File Price: {selectedFile?.filePrice} $APE</p>
                  <p className="pt-2 mt-2 font-semibold">Mint Price: {qty * (selectedFile?.filePrice)} $APE</p>
                </div>
                <div className="flex items-center justify-between border rounded-md">
                  <input className="w-full h-full px-4 py-3 text-sm text-gray-600 rounded-l-md" type="number" placeholder="Insert Token Quantity" value={qty} onChange={(e) => setQty(e.target.value)} />
                  <button className="flex-1 px-4 py-3 text-white bg-orange-600 outline-none rounded-r-md ring-offset-2 ring-orange-600 focus:ring-2"
                    onClick={handleMintNFT}
                  >
                    MINT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="items-start justify-start gap-5 px-4 mx-auto md:px-8 flex flex-col min-h-[30vh] w-full">
      <p className="w-full text-xl font-bold text-orange-600 uppercase ">{type}</p>
      <ul className="grid w-full gap-5 pt-5 border-t sm:grid-cols-2 lg:grid-cols-4">
        {files && (
          files.map((item, key) => (
            <li className="bg-white border rounded-lg shadow-md hover:shadow group" key={key}>
              <div className="flex items-start justify-between gap-10 p-4 min-h-[20vh]">
                <div className="space-y-2">
                  {item.icon}
                  <h4 className="font-semibold text-gray-800">{item.fileName}</h4>
                  <p className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {item.filePrice} $APE</p>
                </div>
                <button onClick={() => handleMintDetails(item.fileId)} className="px-3 py-2 text-sm text-gray-700 duration-150 rounded-lg shadow-md hover:shadow group-hover:bg-orange-500 group-hover:text-white hover:bg-white whitespace-nowrap">Mint NFT</button>
              </div>
              <div className="px-4 py-3 text-right border-t rounded-b-lg group-hover:bg-orange-50 ">
                <button onClick={() => handleCheckDetails(item.fileId)} className="text-sm font-medium text-orange-600 group-hover:text-black hover:text-orange-500 whitespace-nowrap">
                  Check Details
                </button>
              </div>
            </li>
          )))}
        {isLoading &&
          <><li className="bg-white border rounded-lg shadow-md hover:shadow group">
            <div className="flex items-start justify-between gap-10 p-4 min-h-[20vh]">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800"><Skeleton variant="rectangular" width={210} height={50} /></h4>
                <p className="flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <Skeleton variant="rectangular" width={210} height={20} /></p>
              </div>
              <Skeleton variant="rectangular" width={210} height={20} />
            </div>
            <div className="px-4 py-3 text-right border-t rounded-b-lg group-hover:bg-orange-50 ">
              <Skeleton variant="rectangular" width={210} height={20} />
            </div>
          </li>
            <li className="bg-white border rounded-lg shadow-md hover:shadow group">
              <div className="flex items-start justify-between gap-10 p-4 min-h-[20vh]">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800"><Skeleton variant="rectangular" width={210} height={50} /></h4>
                  <p className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <Skeleton variant="rectangular" width={210} height={20} /></p>
                </div>
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
              <div className="px-4 py-3 text-right border-t rounded-b-lg group-hover:bg-orange-50 ">
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
            </li>
            <li className="bg-white border rounded-lg shadow-md hover:shadow group">
              <div className="flex items-start justify-between gap-10 p-4 min-h-[20vh]">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800"><Skeleton variant="rectangular" width={210} height={50} /></h4>
                  <p className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <Skeleton variant="rectangular" width={210} height={20} /></p>
                </div>
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
              <div className="px-4 py-3 text-right border-t rounded-b-lg group-hover:bg-orange-50 ">
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
            </li>
            <li className="bg-white border rounded-lg shadow-md hover:shadow group">
              <div className="flex items-start justify-between gap-10 p-4 min-h-[20vh]">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800"><Skeleton variant="rectangular" width={210} height={50} /></h4>
                  <p className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <Skeleton variant="rectangular" width={210} height={20} /></p>
                </div>
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
              <div className="px-4 py-3 text-right border-t rounded-b-lg group-hover:bg-orange-50 ">
                <Skeleton variant="rectangular" width={210} height={20} />
              </div>
            </li>
          </>
        }
      </ul>

      {isModalOpen && (
        <FileDetailsModal selectedFile={selectedFile} onClose={closeModal} />
      )}
      {isMintModalOpen && (
        <MintNFTModal selectedFile={selectedFile} onClose={closeModal} />
      )}
    </div>
  );
};

export default LatestFiles;
