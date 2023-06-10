// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";
import "./interface/IFileRegistry.sol";

contract FileRegistry is IFileRegistry {
    using Counters for Counters.Counter;
    Counters.Counter private _fileIds;

    NFT public token;

    mapping(address => bool) private isMod;

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
    mapping(string => address) private originalUploaders;
    mapping(string => uint256[]) private filesByType;

    string[] public fileTypes = ["unknown", "picture", "video", "document", "graphics"];

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
        owner = payable(msg.sender);
        platformFee = 0.005 ether;
        token = new NFT(_marketplaceAddress, "FileBloxToken", "FBT"); // @note deploy NFT.sol and link to FileRegistry
        isMod[msg.sender] = true;
    }

    // Modifier to check that the caller is the moderator
    modifier onlyMod() {
        require(isMod[msg.sender], "Not a mod");
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
        require(validateFileType(_fileType), "Invalid file type");
        require(msg.sender != address(0), "seller must be an address");
        require(_fileSize > 0, "empty file");

    // @dev require that the msg.sender is the original uploader 
    //if they're going to call this function using an existing filePath
        require(
            originalUploaders[_filePath] == address(0) || originalUploaders[_filePath] == msg.sender,
            "File already exists with a different uploader"
        );

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

        //updates originalUploaders mapping if file is a new entry
        if (originalUploaders[_filePath] == address(0)) {
            originalUploaders[_filePath] = msg.sender;
        }

        // Add the file ID to the filesByType mapping
        filesByType[_fileType].push(newFileId);

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
    }

    // @dev Allows the user to pay for a file and mint tokens based on the specified token quantity and fileID
    function payForFile(uint256 _fileID, uint256 _tokenQuantity) public payable nonReentrant returns (bool) {
        require(files[_fileID].isBanned != true, "File is banned");

        // Calculate the total price for the specified token quantity
        uint256 totalPrice = (files[_fileID].filePrice + platformFee) * _tokenQuantity;
        require(msg.value >= totalPrice, "Not paid");

        // Calculate the payment for each token
        uint256 paymentPerToken = files[_fileID].filePrice + platformFee;

        // Transfers payment from msg.sender to uploader
        files[_fileID].uploader.transfer(paymentPerToken * _tokenQuantity);

        // Transfers platformFee from msg.sender to contract owner
        payable(owner()).transfer(platformFee * _tokenQuantity);

        for (uint256 i = 0; i < _tokenQuantity; ++i) {
            // Mints token to msg.sender
            uint256 newTokenId = token.mintToken(_fileID, msg.sender, files[_fileID].fileType);

            // Maps fileID to tokenId
            _tokenIds[_fileID] = newTokenId;

            emit FileTokenMinted(_fileID, payable(msg.sender));
        }

        return true;
    }

    // @dev permanently bans a file
    function delistFile(uint256 _fileId) public nonReentrant {
        uint256 fileId = files[_fileId].fileId;
        require(files[_fileId].fileId > 0, "File has to exist");
        require(files[_fileId].uploader == msg.sender || mod == msg.sender, "You are not the creator nor the mod");

        //marks the file as Banned
        files[_fileId].isBanned = true;
    }

    // @dev Returns an array of available files that can be minted.
    function getAvailableFiles() public view returns (File[] memory) {
        uint256[] memory availableFileIds = new uint256[](_fileIds.current());
        uint256 count = 0;

        for (uint256 i = 0; i < _fileIds.current(); ++i) {
            if (!files[i + 1].isBanned) {
                availableFileIds[count] = i + 1;
                count++;
            }
        }

        File[] memory availableFiles = new File[](count);
        for (uint256 i = 0; i < count; i++) {
            File storage file = files[availableFileIds[i]];
            availableFiles[i] = file;
        }

        return availableFiles;
    }

    function getAvailableFilesByType(string memory _fileType) public view returns (uint256[] memory) {
    return filesByType[_fileType];
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

    /**
     * @dev Compares two strings by hashing and comparing the encoded values.
     * @param a The first string to compare.
     * @param b The second string to compare.
     * @return A boolean indicating whether the two strings are equal or not.
     */
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    /**
     * @dev Validates the file type by comparing it with the allowed file types.
     * @param _fileType The file type to validate.
     * @return A boolean indicating whether the file type is valid or not.
     */
    function validateFileType(string memory _fileType) private view returns (bool) {
        for (uint256 i = 0; i < fileTypes.length; ++i) {
            if (compareStrings(_fileType, fileTypes[i])) {
                return true;
            }
        }
        return false;
    }

    // @dev Adds a new file type to the list of valid file types
    function addFileType(string memory _fileType) public onlyOwner {
        require(bytes(_fileType).length > 0, "File type cannot be empty");
        require(!validateFileType(_fileType), "File type already exists");

        fileTypes.push(_fileType);

        emit FileTypeAdded(_fileType);
    }

    // @dev Sets a mod who can cancel a listing that violates rules
    function setMod(address _mod, bool _isMod) public onlyOwner {
        require(_mod != address(0), "Error: moderator shoudn't be zero address");
        isMod[_mod] = _isMod;
    }

    // Sets new platform fee
    function setFee(uint256 _platformFee) public onlyOwner {
        require(_platformFee != 0 && _platformFee <= 100 ether, "Should be a value greater than 0 and less than 100");
        platformFee = _platformFee;
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

    function pause() public onlyOwner {
        pause();
    }

    function unpause() public onlyOwner {
        unpause();
    }
 }
