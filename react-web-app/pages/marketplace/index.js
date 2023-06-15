import LatestFiles from '@/components/sections/LatestFiles'
import GraphicsFiles from '@/components/sections/LatestFiles'
import Link from 'next/link'
import React from 'react'

const index = () => {
    return (
        <div className="min-h-screen px-4 mx-auto md:px-8 py-14">
            <div className="items-start justify-between md:flex">
                <div className="max-w-lg">
                    <h3 className="text-xl font-bold text-gray-800 uppercase sm:text-2xl">
                        FileBlox Marketplace
                    </h3>
                    <p className="mt-2 text-gray-600">

                    </p>
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
            <div className="grid items-start justify-start gap-10 mt-10 overflow-auto">
                <LatestFiles type="picture" />
                <LatestFiles type="music" />
                <LatestFiles type="documents" />
                <LatestFiles type="video" />
                <LatestFiles type="graphics" />
            </div>
        </div>
    )
}

export default index