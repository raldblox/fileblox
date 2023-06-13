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
                        All files
                    </h3>
                    <p className="text-gray-600 mt-2">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
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
            <div className="mt-12 relative h-max overflow-auto">
                <table className="w-full table-auto text-sm text-left">
                    <thead className="text-gray-600 font-medium border-b">
                        <tr>
                            <th className="py-3 pr-6">File Name</th>
                            <th className="py-3 pr-6">Size</th>
                            <th className="py-3 pr-6">Status</th>
                            <th className="py-3 pr-6">Earnings</th>
                            <th className="py-3 pr-6">Price</th>

                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {
                            tableItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="pr-6 py-4 whitespace-nowrap">{item.name}</td>
                                    <td className="pr-6 py-4 whitespace-nowrap">{item.size}</td>
                                    <td className="pr-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-2 rounded-full font-semibold text-xs ${item.status == "Active" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="pr-6 py-4 whitespace-nowrap">{item.tokenID}</td>
                                    <td className="pr-6 py-4 whitespace-nowrap">{item.price}</td>
                                    <td className="text-right whitespace-nowrap">
                                        <a href="javascript:void()" className="py-1.5 px-3 text-gray-600 hover:text-gray-500 duration-150 hover:bg-gray-50 border rounded-lg">
                                            Manage
                                        </a>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}