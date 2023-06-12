import { Context } from "@/context"
import axios from "axios";
import { NFTStorage } from "nft.storage";
import { useContext, useEffect, useState } from "react"
import { AES } from 'crypto-js';

export default () => {

    const { connectWallet, connectedWallet } = useContext(Context);
    const [copyState, setCopyState] = useState(false)

    const [steps, setStep] = useState({
        stepsItems: ["Store to IPFS", "Encrypt Hash", "Record on Chain", "Ready to Tokenize"],
        currentStep: 0
    })

    const [file, setFile] = useState('');
    const [category, setCategory] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState();
    const [fileURL, setMetadataURL] = useState("");
    const [txURL, setTxURL] = useState();
    const [txStatus, setTxStatus] = useState();

    const [fileData, setFileData] = useState({
        filePath: "",
        fileCover: "",
        fileName: "",
        fileSize: "",
        filePrice: "",
        fileDescription: ""
    });

    const handleNextStep = (step) => {
        setStep(prevState => ({
            ...prevState,
            currentStep: step
        }));
    };

    useEffect(() => {
        if (copyState) {
            setTimeout(() => setCopyState(false), 3000)
        }
    }, [copyState])

    const handleFile = (event) => {
        const file = event.target.files[0]; // Get the selected file
        const fileName = file.name; // Get the original file name
        const fileExtension = fileName.split(".").pop(); // Get the file extension
        const renamedFile = new File([file], `file.${fileExtension}`); // Create a new File object with the renamed file

        // You can now use the renamedFile object for further processing or upload
        console.log("File Selected:", renamedFile);
        setFileData((prevState) => ({
            ...prevState,
            filePath: renamedFile,
            fileSize: renamedFile.size,
        }));
        setTxStatus(`File Size: ${renamedFile.size} bytes`);
    }

    const handleCover = (event) => {
        const file = event.target.files[0]; // Get the selected file
        const fileName = file.name; // Get the original file name
        const fileExtension = fileName.split(".").pop(); // Get the file extension
        const renamedFile = new File([file], `cover.${fileExtension}`); // Create a new File object with the renamed file
        console.log("Cover Image:", renamedFile);
        setFileData((prevState) => ({
            ...prevState,
            fileCover: renamedFile,
        }));
    }

    const handleNameChange = (event) => {
        const newName = event.target.value;

        setFileData((prevFileData) => ({
            ...prevFileData,
            fileName: newName,
        }));
    };

    const handleDescriptionChange = (event) => {
        const newDescription = event.target.value;

        setFileData((prevFileData) => ({
            ...prevFileData,
            fileDescription: newDescription,
        }));
    };

    const handlePriceChange = (event) => {
        const newPrice = event.target.value;

        setFileData((prevFileData) => ({
            ...prevFileData,
            filePrice: newPrice,
        }));
    };

    const getIPFSGatewayURL = (ipfsURL) => {
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    };

    const uploadToIPFS = async () => {
        const nftStorage = new NFTStorage({ token: process.env.NFTSTORAGE_API_KEY, });
        try {
            handleNextStep(1);
            setTxStatus("Uploading NFT to IPFS & Filecoin via NFT.storage.");
            console.log(fileData);
            const metaData = await nftStorage.store({
                name: fileData.fileName,
                description: fileData.fileDescription,
                size: fileData.fileSize,
                image: fileData.filePath,
                file: fileData.filePath
            });
            setMetadataURL(getIPFSGatewayURL(metaData.url));
            setTxStatus("Uploaded Successfully!");
            console.log(metaData);
            return metaData;

        } catch (error) {
            setErrorMessage("Could not save NFT to NFT.Storage.");
            console.log(error);
        }
    };

    const encryptURL = async (url) => {
        handleNextStep(2);
        const encryptionKey = process.env.ENCRYPTION_KEY;
        const encryptedURL = AES.encrypt((url), encryptionKey).toString();
        console.log(encryptedURL);
        return encryptedURL;
    };

    const sendFileDataToChain = async (encryptedURL) => {
        const { fileName, fileSize, filePrice, fileType, fileDescription } = fileData;

        try {
            handleNextStep(3);
            setTxStatus("Sending mint transaction to Blockchain.");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const connectedContract = new ethers.Contract(
                nftContractAddress,
                NFT.abi,
                provider.getSigner()
            );
            const tx = await connectedContract.recordFile(encryptedURL, fileName, fileSize, filePrice, fileType, fileDescription);
            console.log(encryptedURL);
            setTxStatus("Minted successfully on the Blockchain.");
            return tx;
        } catch (error) {
            setErrorMessage("Failed to send tx to blockchain.");
            console.log(error);
        }
    }

    const processFile = async (event) => {
        event.preventDefault();
        //1. upload file via NFT.storage
        const metaData = await uploadToIPFS();
        // 2. Encrypt IPFS Hash -- CID
        const encryptedURL = await encryptURL(metaData.url); // Encrypt CID
        // 3. Record to Blockchain
        const fileID = await sendFileDataToChain(encryptedURL);
    }

    // Copy the link
    const handleCopy = () => {
        navigator.clipboard.writeText(fileURL).then(function () {
            setCopyState(true)
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    return (
        <section className="justify-start px-4 py-20 gap-y-5">
            <div className="z-10 max-w-4xl px-4 mx-auto md:px-0">
                <ul aria-label="Steps" className="items-center font-medium text-gray-600 md:flex">
                    {steps.stepsItems.map((item, idx) => (
                        <li aria-current={steps.currentStep == idx + 1 ? "step" : false} className="flex flex-1 last:flex-none md:items-center">
                            <div className="flex gap-x-3">
                                <div className="flex flex-col items-center gap-x-2">
                                    <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${steps.currentStep > idx + 1 ? "bg-orange-600 border-orange-600" : "" || steps.currentStep == idx + 1 ? "border-orange-600" : ""}`}>
                                        <span className={` ${steps.currentStep > idx + 1 ? "hidden" : "" || steps.currentStep == idx + 1 ? "text-orange-600 animate-pulse font-bold" : ""}`}>
                                            {idx + 1}
                                        </span>
                                        {
                                            steps.currentStep > idx + 1 ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            ) : ""
                                        }
                                    </div>
                                    <div className={`h-12 flex items-center md:hidden ${idx + 1 == steps.stepsItems.length ? "hidden" : ""}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center h-8 md:h-auto">
                                    <h3 className={`text-base whitespace-nowrap ${steps.currentStep == idx + 1 ? "text-orange-600" : ""}`}>
                                        {item}
                                    </h3>
                                </div>
                            </div>
                            <div className={`flex-1 hidden md:block ${idx + 1 == steps.stepsItems.length ? "md:hidden" : ""}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <main className="z-10 flex flex-col items-center justify-center w-full sm:px-4">
                <div className="grid w-full space-y-6 text-gray-600 gap-y-5 sm:max-w-2xl">
                    <div className="text-center ">
                        <div className="mt-5 space-y-2">
                            <h3 className="text-2xl font-bold text-gray-800 sm:text-3xl">Let's store something new!</h3>
                            <p className="">
                                {connectedWallet ?
                                    <>Wallet Connected : <span className="font-bold text-orange-600 hover:text-orange-500">{connectedWallet.slice(0, 10)}...{connectedWallet.slice(-10)}</span></> :
                                    <>No Wallet Connected : <button onClick={connectWallet} className="font-bold text-orange-600 hover:text-orange-500">Connect Wallet</button></>
                                }
                            </p>
                        </div>
                    </div>
                    <div className="p-4 py-6 border border-orange-200 shadow hover:shadow-md bg-orange-50 sm:p-6 sm:rounded-lg">
                        <form className="space-y-5">
                            <div>
                                <label htmlFor="file">Select File</label>
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handleFile}
                                    required
                                    className="w-full px-2 flex items-center justify-center gap-x-3 py-2.5 mt-5 border rounded-lg text-sm font-medium bg-white hover:bg-gray-50 duration-150 active:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="file">Select Cover</label>
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handleCover}
                                    required
                                    className="w-full px-2 flex items-center justify-center gap-x-3 py-2.5 mt-5 border rounded-lg text-sm font-medium bg-white hover:bg-gray-50 duration-150 active:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="font-medium">
                                    File Name
                                </label>
                                <input
                                    type="text"
                                    value={fileData.fileName}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-white border rounded-lg shadow-sm outline-none hover:bg-gray-50 focus:border-orange-600"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="font-medium">
                                    File Description
                                </label>
                                <input
                                    type="text"
                                    value={fileData.fileDescription}
                                    onChange={handleDescriptionChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-white border rounded-lg shadow-sm outline-none hover:bg-gray-50 focus:border-orange-600"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="font-medium">
                                    File Price
                                </label>
                                <input
                                    type="text"
                                    value={fileData.filePrice}
                                    onChange={handlePriceChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-white border rounded-lg shadow-sm outline-none hover:bg-gray-50 focus:border-orange-600"
                                />
                            </div>
                            <div>
                                <label className="">
                                    File Category
                                </label>
                                <select
                                    value={fileData.fileCategory}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-white border rounded-lg shadow-sm outline-none hover:bg-gray-50 focus:border-orange-600"
                                >
                                    <option value="">--Select File Category--</option>
                                    <option value="image">Image</option>
                                    <option value="music">Music</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                    <option value="unknown">I don't know</option>
                                </select>
                            </div>
                            <button
                                onClick={e => processFile(e, uploadedFile)}
                                className="w-full px-4 py-2 font-medium text-white duration-150 bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-600"
                            >
                                Upload
                            </button>
                        </form>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                        <label className="flex-[25%]">IPFS Gateway URL</label>
                        <p className="overflow-hidden text-sm text-gray-600">{fileURL.slice(0, 25)}...{fileURL.slice(-20)}</p>
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
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-green-600">{txStatus}</p>
                        <p className="text-red-600">{errorMessage && !txStatus && <>{errorMessage}</>}</p>
                    </div>
                </div>
            </main>
            <div className="absolute border-orange-200 border-b top-0 w-full h-[70vh] md:h-[50vh] bg-gradient-to-b from-orange-50 to-orange-100"></div>
        </section>
    )
}