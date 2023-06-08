const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("FileRegistry", function () {
    let fileRegistry;
    let nft;
    let owner;

    beforeEach(async function () {
        const FileRegistry = await ethers.getContractFactory("FileRegistry");
        [owner] = await ethers.getSigners();
        fileRegistry = await FileRegistry.deploy(owner.address);
        tokenAddess = await fileRegistry.getTokenAddress();
        console.log(`Registry Address: ${fileRegistry.address}, Token Addess: ${tokenAddess}`)
    });

    it("Should record a file", async function () {
        const filePath = "example/path";
        const fileName = "example_file.txt";
        const fileSize = 1024;
        const filePrice = 100;
        const fileType = "text/plain";
        const fileDescription = "Example file";
        const isToken = false;

        const tx = await fileRegistry.recordFile(
            filePath,
            fileName,
            fileSize,
            filePrice,
            fileType,
            fileDescription,
            isToken
        );

        await tx.wait();

        const fileId = 0;

        const [
            retrievedFilePath,
            retrievedFileSize,
            retrievedFilePrice,
            retrievedFileType,
            retrievedFileName,
            retrievedFileDescription,
            retrievedUploader,
        ] = await fileRegistry.getFileDataByFileID(fileId);

        expect(retrievedFilePath).to.equal(filePath);
        expect(retrievedFilePrice).to.equal(filePrice);
    });

    // it("should pay for a file", async function () {
    //     const filePath = "example/path";
    //     const fileName = "example_file.txt";
    //     const fileSize = 1024;
    //     const filePrice = 100;
    //     const fileType = "text/plain";
    //     const fileDescription = "Example file";
    //     const isToken = true;

    //     await fileRegistry.recordFile(
    //         filePath,
    //         fileName,
    //         fileSize,
    //         filePrice,
    //         fileType,
    //         fileDescription,
    //         isToken
    //     );

    //     const fileId = 0;

    //     const payForFileTx = fileRegistry.payForFile(fileId, { value: filePrice });
    //     await payForFileTx.wait();

    //     const [
    //         retrievedFilePath,
    //         retrievedFileSize,
    //         retrievedFilePrice,
    //         retrievedFileType,
    //         retrievedFileName,
    //         retrievedFileDescription,
    //         retrievedUploader,
    //     ] = await fileRegistry.getFileDataByFileID(fileId);

    //     expect(retrievedUploader).to.equal(await ethers.provider.getSigner().getAddress());

    //     const tokensOwnedByMe = await nft.getTokensOwnedByMe();
    //     expect(tokensOwnedByMe.length).to.equal(1);
    //     expect(tokensOwnedByMe[0]).to.equal(0);

    //     const tokenCreator = await nft.getTokenCreatorById(0);
    //     expect(tokenCreator).to.equal(await ethers.provider.getSigner().getAddress());
    // });
});
