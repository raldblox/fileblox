// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFT.sol";
import "./interface/IFileRegistry.sol";

contract FileRegistry is IFileRegistry, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _fileIds;

    NFT public token;
    IERC20 private apeToken;

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
        bool isDelistedByOwner;
        bool isBannedByMod;
    }

    mapping(uint256 => File) public files;
    mapping(uint256 => uint256) private _tokenIds;
    mapping(string => address) private originalUploaders;
    mapping(uint256 => string[]) private filePathHistory; // @note records fileHash history
    mapping(string => uint256[]) private filesByType;

    string[] public fileTypes = ["unknown", "picture", "music", "video", "document", "graphics"];

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

    event FileUpdated(
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
    event FileTypeAdded(string fileType);

    constructor(address _apeTokenAddress) {
        platformFee = 0.005 ether;
        token = new NFT("FileBloxToken", "FBT"); // @note deploy NFT.sol and link to FileRegistry
        isMod[msg.sender] = true;
        apeToken = IERC20(_apeTokenAddress);
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
        require(originalUploaders[_filePath] == address(0), "File already exists with a different uploader");

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
            false,
            false
        );

        //updates originalUploaders mapping if file is a new entry
        originalUploaders[_filePath] = msg.sender;

        // record filePath for history tracking
        filePathHistory[newFileId].push(_filePath);

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

    function updateFile(
        uint256 _fileId,
        string memory _filePath, // @note encrypted hash
        string memory _fileName,
        uint256 _fileSize,
        uint256 _filePrice,
        string memory _fileType,
        string memory _fileDescription
    ) public payable nonReentrant {
        require(bytes(_filePath).length > 0, "filepath required");
        require(bytes(_fileType).length > 0, "filetype required");
        require(bytes(_fileName).length > 0, "filename required");
        require(validateFileType(_fileType), "Invalid file type");
        require(_fileSize > 0, "empty file");
        require(files[_fileId].uploader == msg.sender || isMod[msg.sender], "caller not the file uploader");

        // @dev require that filePath exist
        require(originalUploaders[_filePath] != address(0), "File path does not exist");

        File storage file = files[_fileId];

        // Convert the file price from ethers to wei
        uint256 _filePriceinWei = _filePrice * 1 ether;

        // Update the file information
        file.filePath = _filePath;
        file.fileName = _fileName;
        file.fileSize = _fileSize;
        file.filePrice = _filePriceinWei;
        file.fileType = _fileType;
        file.fileDescription = _fileDescription;

        // record originalUploaders of filePath
        originalUploaders[_filePath] = msg.sender;

        // record filePath for history tracking
        filePathHistory[_fileId].push(_filePath);

        // Add the file ID to the filesByType mapping
        filesByType[_fileType].push(_fileId);

        emit FileUpdated(
            _fileId,
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
    function payForFile(uint256 _fileID, uint256 _tokenQuantity) public nonReentrant returns (bool) {
        require(files[_fileID].uploader != address(0), "File does not exist");
        require(!files[_fileID].isBannedByMod, "File is banned by moderators");
        require(!files[_fileID].isDelistedByOwner, "File is delisted by uploader");

        // Calculate the total price for the specified token quantity
        uint256 totalPrice = (files[_fileID].filePrice + platformFee) * _tokenQuantity;

        // Makes sure that msg.sender has enough APE balance to make the transaction
        require(apeToken.balanceOf(msg.sender) >= totalPrice, "Insufficient tokens");

        // Transfer APE tokens from msg.sender to the contract. I used this syntax for max security
        // will revert if transfer returns false
        (bool success, bytes memory data) = address(apeToken).call(
            abi.encodeWithSelector(apeToken.transferFrom.selector, msg.sender, address(this), totalPrice)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");

        // Calculate the payment for each token
        uint256 paymentPerToken = files[_fileID].filePrice;

        // Transfer payment in APE tokens from the contract to the uploader
        (success, data) = address(apeToken).call(
            abi.encodeWithSelector(
                apeToken.transfer.selector,
                files[_fileID].uploader,
                paymentPerToken * _tokenQuantity
            )
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");

        // Transfer platformFee in APE tokens from the contract to the owner
        (success, data) = address(apeToken).call(
            abi.encodeWithSelector(apeToken.transfer.selector, owner(), platformFee * _tokenQuantity)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");

        for (uint256 i = 0; i < _tokenQuantity; ++i) {
            // Mints token to msg.sender
            uint256 newTokenId = token.mintToken(_fileID, msg.sender, files[_fileID].fileType);

            // Maps fileID to tokenId
            _tokenIds[_fileID] = newTokenId;

            emit FileTokenMinted(_fileID, payable(msg.sender));
        }

        return true;
    }

    // @dev moderators ban/unban a file
    function banFile(uint256 _fileId, bool _isBanned) public onlyMod {
        require(files[_fileId].uploader == address(0), "File has to exist");

        //marks the file as Banned
        files[_fileId].isBannedByMod = _isBanned;
    }

    // @dev file uploader delist a file
    function delistMyFile(uint256 _fileId, bool _isDelisted) public nonReentrant {
        require(files[_fileId].uploader == address(0), "File has to exist");
        require(files[_fileId].uploader == msg.sender, "You are not the creator.");

        //marks the file as Banned
        files[_fileId].isDelistedByOwner = _isDelisted;
    }

    // @dev Returns an array of available files that can be minted.
    function getAvailableFiles() public view returns (File[] memory) {
        uint256[] memory availableFileIds = new uint256[](_fileIds.current());
        uint256 count = 0;

        for (uint256 i = 0; i < _fileIds.current(); ++i) {
            if (!files[i + 1].isBannedByMod) {
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

    function getFilePathHistory(uint256 _fileId) public view returns (string[] memory) {
        return filePathHistory[_fileId];
    }

    function getFileDataByFileID(
        uint256 _fileID
    )
        public
        view
        override
        returns (
            string memory filePath,
            uint256 fileSize,
            uint256 filePrice,
            string memory fileType,
            string memory fileName,
            string memory fileDescription,
            address payable uploader,
            bool isBannedByMod,
            bool isDelistedByOwner
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
            file.uploader,
            file.isBannedByMod,
            file.isDelistedByOwner
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

    // @dev Sets mods who can ban/delist file that violates rules
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

    function getCurrencyAddress() public view returns (address) {
        return address(apeToken);
    }

    function getTokenIdByFileId(uint256 fileId) public view returns (uint256) {
        return _tokenIds[fileId];
    }

    function getFileIdByTokenId(uint256 tokenId) external view returns (uint256) {
        return token.getFileIdByTokenId(tokenId);
    }

    function pause() public onlyOwner {
        pause();
    }

    function unpause() public onlyOwner {
        unpause();
    }
}
