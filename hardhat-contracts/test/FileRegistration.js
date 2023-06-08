const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("FileRegistry", function () {
    let fileRegistry;
    let token;
    let owner;
    let buyer;

    beforeEach(async function () {
        const FileRegistry = await ethers.getContractFactory("FileRegistry");
        [owner, buyer] = await ethers.getSigners();
        fileRegistry = await FileRegistry.deploy(owner.address);
        tokenAddess = await fileRegistry.getTokenAddress();
        token = await ethers.getContractAt("NFT", tokenAddess);
    });

    describe("File Registry System", function () {
        const filePath = "example/path";
        const fileName = "example_file.txt";
        const fileSize = 1024;
        const filePrice = 100;
        const fileType = "text/plain";
        const fileDescription = "Example file";


        it("Should record a file", async function () {
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

        it("Should record a file and mint token", async function () {
            const isToken = true;
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
            expect(await fileRegistry.getTokenIdByFileId(fileId)).to.equal(0);
        });

        it("Should pay for a file and mint token", async function () {
            const isToken = false;
            await fileRegistry.recordFile(
                filePath,
                fileName,
                fileSize,
                filePrice,
                fileType,
                fileDescription,
                isToken
            );

            const fileId = 0;

            await fileRegistry.connect(buyer).payForFile(fileId, { value: filePrice });

            const [
                retrievedFilePath,
                retrievedFileSize,
                retrievedFilePrice,
                retrievedFileType,
                retrievedFileName,
                retrievedFileDescription,
                retrievedUploader,
            ] = await fileRegistry.getFileDataByFileID(fileId);

            expect(buyer.address).to.equal(await token.ownerOf(0));

            const fileIdByTokenId = await fileRegistry.getFileIdByTokenId(0);
            expect(fileIdByTokenId).to.equal(0);
        });
    });

});
