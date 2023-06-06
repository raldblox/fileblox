import { Context } from "@/context"
import axios from "axios";
import { NFTStorage } from "nft.storage";
import { useContext, useEffect, useState } from "react"
console.log(process.env)

export default () => {

    const { connectWallet, connectedWallet } = useContext(Context);
    const [copyState, setCopyState] = useState(false)

    const [steps, setStep] = useState({
        stepsItems: ["Store to IPFS", "Tokenize as NFT", "Sell to Marketplace"],
        currentStep: 0
    })

    const [file, setFile] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState();
    const [fileURL, setMetadataURL] = useState("");
    const [txURL, setTxURL] = useState();
    const [txStatus, setTxStatus] = useState();

    const handleNextStep = (step) => {
        setStep(prevState => ({
            ...prevState,
            currentStep: step
        }));
    };

    // Copy the link
    const handleCopy = () => {
        navigator.clipboard.writeText(fileURL).then(function () {
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

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
        console.log("New File Set");
    }

    const getIPFSGatewayURL = (ipfsURL) => {
        let urlArray = ipfsURL.split("/");
        let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
        return ipfsGateWayURL;
    };

    const mintNFTToken = async (event, uploadedFile) => {
        event.preventDefault();
        handleNextStep(1);
        //1. upload NFT content via NFT.storage
        const metaData = await uploadToIPFS(file);
        handleNextStep(2);

        // //2. Mint a NFT token
        // const mintNFTTx = await sendTxToChain(metaData);

        // //3. preview the minted nft
        // previewNFT(metaData, mintNFTTx);
    }

    const uploadToIPFS = async (inputFile) => {
        const nftStorage = new NFTStorage({ token: process.env.NFTSTORAGE_API_KEY, });
        try {
            setTxStatus("Uploading NFT to IPFS & Filecoin via NFT.storage.");
            const metaData = await nftStorage.store({
                name: name,
                description: description,
                image: inputFile,
                file: inputFile
            });
            setMetadataURL(getIPFSGatewayURL(metaData.url));
            console.log(metaData);
            return metaData;

        } catch (error) {
            setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
            console.log(error);
        }
    }

    const sendTxToChain = async (metadata) => {
        try {
            setTxStatus("Sending mint transaction to Blockchain.");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const connectedContract = new ethers.Contract(
                nftContractAddress,
                NFT.abi,
                provider.getSigner()
            );
            const mintNFTTx = await connectedContract.mintItem(metadata.url);
            return mintNFTTx;
        } catch (error) {
            setErrorMessage("Failed to send tx to blockchain.");
            console.log(error);
        }
    }

    const previewNFT = (metaData, mintNFTTx) => {
        setMetadataURL(getIPFSGatewayURL(metaData.url));
        setTxURL('https://filecoin.com/tx/' + mintNFTTx.hash);
        setTxStatus("NFT is minted successfully!");
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    return (
        <section className="justify-start px-4 py-20 gap-y-5">
            <div className="z-10 max-w-4xl px-4 mx-auto md:px-0">
                <ul aria-label="Steps" className="items-center font-medium text-gray-600 md:flex">
                    {steps.stepsItems.map((item, idx) => (
                        <li aria-current={steps.currentStep == idx + 1 ? "step" : false} className="flex flex-1 last:flex-none md:items-center">
                            <div className="flex gap-x-3">
                                <div className="flex flex-col items-center gap-x-2">
                                    <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${steps.currentStep > idx + 1 ? "bg-orange-600 border-orange-600" : "" || steps.currentStep == idx + 1 ? "border-orange-600" : ""}`}>
                                        <span className={` ${steps.currentStep > idx + 1 ? "hidden" : "" || steps.currentStep == idx + 1 ? "text-orange-600" : ""}`}>
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
                                    onChange={handleFileUpload}
                                    required
                                    className="w-full px-2 flex items-center justify-center gap-x-3 py-2.5 mt-5 border rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-50 duration-150 active:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="font-medium">
                                    File Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-transparent border rounded-lg shadow-sm outline-none focus:border-orange-600"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="font-medium">
                                    File Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-transparent border rounded-lg shadow-sm outline-none focus:border-orange-600"
                                />
                            </div>
                            <button
                                onClick={e => mintNFTToken(e, uploadedFile)}
                                className="w-full px-4 py-2 font-medium text-white duration-150 bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-600"
                            >
                                Upload to IPFS
                            </button>
                        </form>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                        <label>IPFS Gateway URL</label>
                        <p className="overflow-hidden text-sm text-gray-600">{fileURL}</p>
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
                </div>
            </main>
            <div className="absolute border-orange-200 border-b top-0 w-full h-[70vh] md:h-[50vh] bg-gradient-to-b from-orange-50 to-orange-100"></div>
        </section>
    )
}