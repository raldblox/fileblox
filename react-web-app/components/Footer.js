import { Facebook, LinkedIn, Twitter, YouTube } from "@mui/icons-material"

export default () => {

    const footerNavs = [
        {
            label: "Company",
            items: [
                {
                    href: 'javascript:void()',
                    name: 'Partners'
                },
                {
                    href: 'javascript:void()',
                    name: 'Blog'
                },
                {
                    href: 'javascript:void()',
                    name: 'Team'
                },
                {
                    href: 'javascript:void()',
                    name: 'Careers'
                },
            ],
        },
        {
            label: "Resources",
            items: [
                {
                    href: 'javascript:void()',
                    name: 'Contact'
                },
                {
                    href: 'javascript:void()',
                    name: 'Support'
                },
                {
                    href: 'javascript:void()',
                    name: 'Docs'
                },
                {
                    href: 'javascript:void()',
                    name: 'Pricing'
                },
            ],
        },
        {
            label: "About",
            items: [
                {
                    href: 'javascript:void()',
                    name: 'Terms'
                },
                {
                    href: 'javascript:void()',
                    name: 'License'
                },
                {
                    href: 'javascript:void()',
                    name: 'Privacy'
                },
                {
                    href: 'javascript:void()',
                    name: 'About Us'
                },
            ]
        }
    ]

    return (
        <footer className="text-gray-200 bg-black px-4 py-5 mx-auto md:px-8">
            <div className="gap-6 justify-between md:flex">
                <div className="flex-1">
                    <div className="max-w-xs">
                        <a href="javascript:void(0)" className='font-bold text-3xl text-orange-500'>
                            FileBlox
                        </a>
                        <p className="leading-relaxed mt-2 text-[15px]">
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                    </div>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <label className="block pt-4 pb-2">
                            Stay up to date
                        </label>
                        <div className="max-w-sm flex items-center border rounded-md p-1 gap-1">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-2.5 outline-none rounded-md"
                            />
                            <button
                                className="p-2.5 rounded-md text-white bg-orange-600 outline-none shadow-md focus:shadow-none sm:px-5"
                            >
                                Subscribe
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex-1 mt-10 space-y-6 items-center justify-between sm:flex md:space-y-0 md:mt-0">
                    {
                        footerNavs.map((item, idx) => (
                            <ul
                                className="space-y-4"
                                key={idx}
                            >
                                <h4 className="text-orange-500 font-bold">
                                    {item.label}
                                </h4>
                                {
                                    item.items.map(((el, idx) => (
                                        <li key={idx}>
                                            <a
                                                href={el.href}
                                                className="hover:underline hover:text-orange-600"

                                            >
                                                {el.name}
                                            </a>
                                        </li>
                                    )))
                                }
                            </ul>
                        ))
                    }
                </div>
            </div>
            <div className="mt-8 py-6 border-t items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0">
                    &copy; 2023 FileBlox. All rights reserved.
                </div>
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center hover:text-orange-500">
                            <a href="javascript:void()">
                                <Facebook />
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center hover:text-orange-500">
                            <a href="javascript:void()">
                                <Twitter />
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center hover:text-orange-500">
                            <a href="javascript:void()">
                                <LinkedIn />
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center hover:text-orange-500">
                            <a href="javascript:void()">
                                <YouTube />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <style jsx>{`
                .svg-icon path,
                .svg-icon polygon,
                .svg-icon rect {
                    fill: currentColor;
                }
            `}</style>
        </footer>
    )
}
