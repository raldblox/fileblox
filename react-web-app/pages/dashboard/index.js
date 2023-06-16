import MyTokens from "@/components/sections/MyNFTs"
import Link from "next/link"

export default () => {

    const tableItems = [
        {
            name: "Monalisa Pixel Art",
            size: "5MB",
            status: "Active",
            price: "$35.000",
            tokenID: "1"
        },
        {
            name: "Wonderland",
            size: "2KB",
            status: "Active",
            price: "$12.000",
            tokenID: "1"
        },
        {
            name: "Marvels",
            size: "12GB",
            status: "Archived",
            price: "$20.000",
            tokenID: "1"
        },
        {
            name: "Multiverse",
            size: "14MB",
            status: "Active",
            price: "$5.000",
            tokenID: "1"
        },
        {
            name: "Colon tiger",
            size: "112KB",
            status: "Active",
            price: "$9.000",
            tokenID: "1"
        },
    ]


    return (
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 min-h-screen py-14">
            <div className="items-start justify-between md:flex">
                <div className="max-w-lg">
                    <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                        My Tokens
                    </h3>
                </div>
                <div className="mt-3 md:mt-0">
                    <Link
                        href="/marketplace/upload"
                        className="inline-block px-4 py-2 text-white duration-150 font-medium bg-orange-600 rounded-lg hover:bg-orange-500 active:bg-orange-700 md:text-sm"
                    >
                        Upload file
                    </Link>
                </div>
            </div>
            <MyTokens />
        </div>
    )
}