// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./NFT.sol";

contract FileRegistry {
    using Counters for Counters.Counter;
    Counters.Counter private _fileIds;

    NFT public token;

    struct File {
        uint256 fileId;
        string filePath;
        uint256 fileSize;
        uint256 filePrice;
        string fileType;
        string fileName;
        string fileDescription;
        address payable uploader;
    }

    mapping(uint256 => File) public files;

    event FileRecorded(
        uint256 fileId,
        string filePath,
        uint256 fileSize,
        uint256 filePrice,
        string fileType,
        string fileName,
        string fileDescription,
        address payable uploader
    );

    event FileTokenMinted(uint256 indexed fileId, address buyerAddress);

    constructor(address _marketplaceAddress) {
        token = new NFT(_marketplaceAddress, "FileBloxToken", "FBT");
    }

    function recordFile(
        string memory _filePath, // @note encrypted hash
        string memory _fileName,
        uint256 _fileSize,
        uint256 _filePrice,
        string memory _fileType,
        string memory _fileDescription,
        bool isToken
    ) public returns (uint256) {
        require(bytes(_filePath).length > 0);
        require(bytes(_fileType).length > 0);
        require(bytes(_fileName).length > 0);
        require(msg.sender != address(0));
        require(_fileSize > 0);

        uint256 newFileId = _fileIds.current();
        _fileIds.increment();

        files[newFileId] = File(
            newFileId,
            _filePath,
            _fileSize,
            _filePrice,
            _fileType,
            _fileName,
            _fileDescription,
            payable(msg.sender)
        );

        emit FileRecorded(
            newFileId,
            _filePath,
            _fileSize,
            _filePrice,
            _fileType,
            _fileName,
            _fileDescription,
            payable(msg.sender)
        );

        if (isToken) {
            token.mintToken(newFileId);
        }

        return newFileId;
    }

    function payForFile(uint256 _fileID) public payable returns (bool) {
        require(msg.value >= files[_fileID].filePrice, "Not paid");
        token.mintToken(_fileID);
        emit FileTokenMinted(_fileID, payable(msg.sender));
        return true;
    }

    function getFileDataByFileID(
        uint256 _fileID
    )
        public
        view
        returns (
            string memory filePath,
            uint256 fileSize,
            uint256 filePrice,
            string memory fileType,
            string memory fileName,
            string memory fileDescription,
            address payable uploader
        )
    {
        File memory file = files[_fileID];

        return (
            file.filePath,
            file.fileSize,
            file.filePrice,
            file.fileType,
            file.fileName,
            file.fileDescription,
            file.uploader
        );
    }

    function getTokenAddress() public view returns (address) {
        return address(token);
    }
}
