# FileBlox

FileBlox is a decentralized marketplace for encrypted NFTs that enables the creation of secure and exclusive digital assets. This documentation provides an overview of the FileBlox project, its features, and the technologies used in its development.

## Table of Contents

- [Introduction](#introduction)
- [Decentralized Marketplace for Encrypted NFTs](#decentralized-marketplace-for-encrypted-nfts)
- [How FileBlox Solves the Problem](#how-fileblox-solves-the-problem)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Future Development](#future-development)

## Introduction

FileBlox is designed specifically for digital creators, offering a secure and efficient way to tokenize and monetize their creative works on their own terms. It addresses a common challenge faced by NFT creators – the ability for anyone to freely download their content from NFT marketplaces.

By leveraging encryption technology and decentralized storage, FileBlox ensures that exclusive content remains protected, accessible only to authorized users who have legitimately paid for it. This protects the value and exclusivity of the NFTs while providing digital creators with a reliable marketplace for their encrypted works.

## Decentralized Marketplace for Encrypted NFTs

NFT marketplaces have revolutionized the way artists, designers, musicians, and content creators engage with their audience, monetize their works, and reduce the number of intermediaries involved. However, a prominent issue with traditional NFTs is that exclusive content can be easily downloaded and accessed by anyone.

FileBlox introduces a decentralized marketplace for encrypted NFTs, addressing this challenge head-on. By encrypting the content and leveraging advanced technologies, FileBlox ensures that only authorized users who have purchased the NFT can access and enjoy the content. This enhances the value and exclusivity of the NFTs, providing digital creators with a secure and reliable platform.

## How FileBlox Solves the Problem

The process of using FileBlox is simple and secure:

1. Content creators upload their files, including the file properties such as name, price, and description, along with a cover image that serves as the image placeholder for the encrypted NFT in the marketplace.


3. The backend of FileBlox automatically uploads the file to IPFS (InterPlanetary File System), encrypts its location, and returns a hash that is minted as a property of the NFT.
4. The recorded encrypted file is then listed in the FileBlox marketplace for minting by anyone who wanted to get access to the file.
![fileblox mint](https://github.com/raldblox/fileblox/assets/101350894/9a5f8919-fe23-4829-80ec-cf3d7520fc51)


5. When a user purchases the NFT, they can view it on their user dashboard. Clicking the download button triggers FileBlox to check if the user owns the NFT containing the hash. If authorized, the file is decrypted, and the user is provided with the location to access the file.
![fileblox dashboard](https://github.com/raldblox/fileblox/assets/101350894/04a43763-606e-493d-8b1b-0bf6ee5ca3b9)
![Screenshot (387)](https://github.com/raldblox/fileblox/assets/101350894/00ad83b3-f168-4328-8707-e7ec9fc6d93a)


This process ensures that exclusive content remains protected and accessible only to those who have legitimately purchased the NFTs, safeguarding the value and exclusivity of the digital creations.

## Technologies Used

FileBlox utilizes a combination of cutting-edge technologies to create a robust and secure decentralized file marketplace:

- **Smart Contract Development**: Hardhat and Solidity are used for efficient smart contract development, allowing for smooth writing, testing, and deployment of FileBlox's core functionalities.

- **EthersJS**: EthersJS is employed to make calls to the existing smart contracts, facilitating seamless interactions between the frontend and the blockchain.

- **Encryption**: CryptoJS is utilized for reliable encryption and decryption of the file properties, ensuring secure handling of sensitive information.

- **Frontend Development**: ReactJS, NextJS, and TailwindCSS power the frontend, offering flexibility, scalability, and speed in developing the user interface and enhancing the overall user experience.

- **Decentralized Storage**: Filecoin, a decentralized storage network, is integrated to provide reliable and efficient storage solutions for users' files. IPFS, in combination with NFT.storage, a distributed file storage system, ensures fault tolerance and high availability for the encrypted files.

- **Marketplace Currency**: Apecoin serves as the main marketplace currency within FileBlox, enabling users to access the broader Ape ecosystem and enhancing their overall experience on the platform.

## Getting Started

To get started with FileBlox, follow these steps:

1. Clone the FileBlox repository from GitHub.
2. Install the necessary dependencies by running `npm install` in the project directory.
3. Configure the environment variables, including the blockchain network provider, API keys for IPFS and Filecoin integration, and any other required configurations.
4. Build and deploy the smart contracts using Hardhat.
5. Start the frontend development server using `npm run dev`.
6. Access FileBlox through the provided localhost address and explore its features and functionalities.

Please refer to the project's detailed documentation for more specific instructions on installation, configuration, and deployment.

## Future Development

FileBlox is an ongoing project, and there are several areas of improvement and future development possibilities:

* Integration of Zero-Knowledge (ZK) technology to enhance the decryption process, further protecting the privacy and security of the encrypted files.
* Continuous optimization and enhancement of the user interface and user experience based on feedback and user testing.
* Integration of additional blockchain networks and decentralized storage options to provide users with more choices and flexibility.
* Implementation of advanced search and filtering capabilities to improve the discoverability of encrypted NFTs within the marketplace.

By leveraging the existing technologies, strategic partnerships, and constant innovation, FileBlox aims to provide digital creators and users worldwide with a seamless, secure, and decentralized storage and marketplace experience.

***

We welcome contributions, feedback, and collaborations from the community to make FileBlox an even more robust and impactful solution for digital creators in the NFT space.
