// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";

contract FileRegistry {
    using Counters for Counters.Counter;
    Counters.Counter private _fileIds;

    NFT public token;

    address private mod;

    uint256 private platformFee;

    struct File {
        uint256 fileId;
        string filePath;
        uint256 fileSize;
        uint256 filePrice;
        string fileType;
        string fileName;
        string fileDescription;
        address payable uploader;
        bool isBanned;
    }

    mapping(uint256 => File) public files;
    mapping(uint256 => uint256) private _tokenIds;

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

    constructor(address _marketplaceAddress, address _mod) {
        owner = payable(msg.sender);
        platformFee = 0.005 ether;
        // @dev what does this line do?
        token = new NFT(_marketplaceAddress, "FileBloxToken", "FBT");
        _mod = mod;
    }

    // Modifier to check that the caller is the moderator
    modifier onlyMod() {
        require(msg.sender == mod, "Not a mod");
        _;
    }

    function recordFile(
        string memory _filePath, // @note encrypted hash
        string memory _fileName,
        uint256 _fileSize,
        uint256 _filePrice,
        string memory _fileType,
        string memory _fileDescription
    ) public payable nonReentrant returns (uint256) {
        require(bytes(_filePath).length > 0, "filepath required");
        require(bytes(_fileType).length > 0, "filetype required");
        require(bytes(_fileName).length > 0, "filename required");
        require(msg.sender != address(0), "seller must be an address");
        require(_fileSize > 0, "empty file");

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
            payable(msg.sender),
            false
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

        ////mints token upon upload if isToken is true
        //if (isToken) {
        //    // @audit CRITICAL: you get to mint nearly free from this function. 
        //    //anyone can just reupload a file hash from the market and mint the token.
        //    //once they have a reuploaded nft, they can get access to the original file'
        //    require(msg.value >= platformFee, "Pls pay listing fee");
        //    owner.transfer(platformFee);
        //    uint256 newTokenId = token.mintToken(newFileId, msg.sender);
        //    _tokenIds[newFileId] = newTokenId;
        //emit FileTokenMinted(newFileId, msg.sender);
        }

    function payForFile(uint256 _fileID) public payable nonReentrant returns (bool) {
        require(files[_fileID].isBanned != true, "File is banned");
        require(msg.value >= (files[_fileID].filePrice + platformFee), "Not paid");

        //transfers payment from msg.sender to uploader
        files[_fileID].uploader.transfer(files[_fileID].filePrice);

        //transfers platformFee from msg.sender to contract owner
        owner.transfer(platformFee);

        //mints token to msg.sender
        uint256 newTokenId = token.mintToken(_fileID, msg.sender);

        //i'm not sure what this does
        _tokenIds[_fileID] = newTokenId;

        emit FileTokenMinted(_fileID, payable(msg.sender));
        return true;
    }

    // @dev marks the file as banned. Can't payForFile when banned, will also add !isBanned to require on view functions
    function delistFile(uint256 _fileId) public payable nonReentrant {
        uint256 fileId = files[_fileId].fileId;
        require(files[_fileId].fileId > 0, "File has to exist");
        require(files[_fileId].uploader == msg.sender || mod == msg.sender, "You are not the creator nor the mod");
        
        //marks the file as Banned
        fileId.isBanned = true;
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
            address payable 
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

    // @dev This seems to be the best way to compare strings in Solidity
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // @dev Sets a mod who can cancel a listing that violates rules
    function setMod(address _mod) public onlyOwner {
    require(_mod != address(0), "Error: moderator shoudn't be zero address");
    _mod = mod;
    }

    // Sets new platform fee
    function setFee(uint256 _platformFee) public onlyOwner {
    require(_platformFee != 0 && _platformFee <= 100 ether, "Should be a value greater than 0 and less than 100");
    _platformFee = platformFee;
    }

    function getPlatformFee() public view returns (uint256) {
    return platformFee;
    }

    function getTokenAddress() public view returns (address) {
        return address(token);
    }

    function getTokenIdByFileId(uint256 fileId) public view returns (uint256) {
        return _tokenIds[fileId];
    }

    function getFileIdByTokenId(uint256 tokenId) external view returns (uint256) {
        return token.getFileIdByTokenId(tokenId);
    }

    /**
     * @dev TO DO: Transfer ownership of the contract to a multisig wallet
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        owner = newOwner;
    }

    function pause() public onlyOwner {pause();}
  
    function unpause() public onlyOwner {unpause();}
}
