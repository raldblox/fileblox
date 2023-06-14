import LatestFiles from '@/components/sections/LatestFiles'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Page() {
    const router = useRouter()
    return (
        <>
            <div className=" mx-auto px-4 md:px-8 min-h-screen py-14">
                <div className="items-start justify-between md:flex">
                    <div className="max-w-lg">
                        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl uppercase">
                            Recent files ({router.query.type})
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
                <div className="items-start mt-10 justify-start md:flex overflow-auto">
                    <LatestFiles type={router.query.type} />
                </div>
            </div>
        </>)
}