import { Context } from "@/context"
import { useContext, useState } from "react"

export default () => {

    const { connectWallet, connectedWallet } = useContext(Context);

    const [steps, setStep] = useState({
        stepsItems: ["Store File to IPFS", "Tokenize as NFT", "Sell to Marketplace"],
        currentStep: 2
    })

    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            formData.append('description', description);

            const response = await axios.post('/api/upload', formData);
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.log('Error uploading file:', error);
        }
    };

    return (
        <section className="justify-start px-4 py-20 gap-y-10">
            <div className="max-w-4xl px-4 mx-auto md:px-0">
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
                                    <h3 className={`text-sm ${steps.currentStep == idx + 1 ? "text-orange-600" : ""}`}>
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

            <main className="flex flex-col items-center justify-center w-full sm:px-4">
                <div className="w-full space-y-6 text-gray-600 sm:max-w-xl">
                    <div className="text-center ">
                        <div className="mt-5 space-y-2">
                            <h3 className="text-2xl font-bold text-gray-800 sm:text-3xl">Upload your file</h3>
                            <p className="">
                                {connectedWallet ?
                                    <>Wallet Connected : <span className="font-bold text-orange-600 hover:text-orange-500">{connectedWallet}</span></> :
                                    <>No Wallet Connected : <button onClick={connectWallet} className="font-bold text-orange-600 hover:text-orange-500">Connect Wallet</button></>
                                }
                            </p>
                        </div>
                    </div>
                    <div className="p-4 py-6 shadow bg-orange-50 sm:p-6 sm:rounded-lg">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"

                        >
                            <div>
                                <label htmlFor="file">Select File</label>
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full px-2 flex items-center justify-center gap-x-3 py-2.5 mt-5 border rounded-lg text-sm font-medium hover:bg-gray-50 duration-150 active:bg-gray-100"
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
                                    type="email"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    required
                                    className="w-full px-3 py-2 mt-2 text-gray-500 bg-transparent border rounded-lg shadow-sm outline-none focus:border-orange-600"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 font-medium text-white duration-150 bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-600"
                            >
                                Upload to IPFS
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </section>
    )
}