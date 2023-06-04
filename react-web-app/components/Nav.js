import React from 'react'

const Nav = () => {
    return (
        <nav className='flex justify-between bg-white text-black border-b-2 border-black sticky top-0'>
            <ul className=''>
                <li>
                    <h1 className='logo'>FileBlox</h1>
                </li>
            </ul>
            <ul className=''>
                <li>
                    Discover
                </li>
                <li>
                    Features
                </li>
            </ul>
            <button className='bg-black font-bold hover:bg-white hover:text-black text-white text-xl px-10 py-5 border-l-2 border-black'>
                Connect Wallet
            </button>
        </nav>
    )
}

export default Nav