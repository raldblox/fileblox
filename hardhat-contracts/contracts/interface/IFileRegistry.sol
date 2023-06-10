// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IFileRegistry {
    function getFileDataByFileID(uint256 _fileID)
        external
        view
        returns (
            string memory filePath,
            uint256 fileSize,
            uint256 filePrice,
            string memory fileType,
            string memory fileName,
            string memory fileDescription,
            address payable uploader
            bool isBanned;
        );
}
