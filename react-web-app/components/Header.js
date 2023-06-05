import Head from 'next/head'
import React from 'react'

const Header = () => {
    return (
        <Head>
            <title>FileBlox | A decentralized marketplace for copyrighted content</title>
            <meta name="description" content="A decentralized marketplace for copyrighted content" />
            <meta name="author" content="Team FileBlox" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="" />
            <meta property="og:title" content="FileBlox" />
            <meta property="og:description" content="Fileblox: A decentralized marketplace for copyrighted content" />
            <meta property="og:image" content="" />
            <meta property="og:image:alt" content="FileBlox" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content="@FileBlox" />
            <meta property="twitter:title" content="" />
            <meta property="twitter:description" content="Fileblox: A decentralized marketplace for copyrighted content" />
            <meta property="twitter:image" content="" />
            <link rel="apple-touch-icon" content="" />
        </Head>
    )
}

export default Header