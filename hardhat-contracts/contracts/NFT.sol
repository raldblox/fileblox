// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interface/IFileRegistry.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private registryAddress;

    mapping(uint256 => address) private _creators;
    mapping(uint256 => uint256) private _fileIds;
    mapping(uint256 => string) private _fileTypes;

    event TokenMinted(uint256 indexed tokenId, uint256 fileId, address registryAddress);

    constructor(string memory _tokenName, string memory _tokenSymbol, address _registryAddress) ERC721(_tokenName, _tokenSymbol) {
        registryAddress = _registryAddress;
    }

    // Modifier to check that the caller is the File Registry Contract
    modifier onlyRegistry() {
        require(msg.sender == registryAddress, "Not owner");
        _;
    }

    function mintToken(uint256 _fileId, address _owner, string memory _fileType) public onlyRegistry returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
        _mint(_owner, newItemId);
        _creators[newItemId] = _owner;

        //maps tokenID to fileType
        _fileTypes[newItemId] = _fileType;

        //maps tokenID to fileId
        _fileIds[newItemId] = _fileId;

        // Give the marketplace approval to transact NFTs between users
        setApprovalForAll(registryAddress, true);

        emit TokenMinted(newItemId, _fileId, registryAddress);
        return newItemId;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Error: Nonexistent Token");
        uint256 fileId = _fileIds[tokenId];

        IFileRegistry fileRegistry = IFileRegistry(registryAddress);
        (
            string memory filePath,
            uint256 fileSize,
            uint256 filePrice,
            string memory fileType,
            string memory fileName,
            string memory fileDescription,
            address payable uploader,
            bool isBannedByMod,
            bool isDelistedByOwner
        ) = fileRegistry.getFileDataByFileID(fileId);

        string memory fileAttributes_ = generateAttributes(fileType, fileDescription, fileSize, filePrice);

        string memory fileImage_ = generateImage(fileId);

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                fileName,
                                '", "description":"',
                                fileDescription,
                                '", "image": "',
                                fileImage_,
                                '", "attributes": [',
                                fileAttributes_,
                                "],}"
                            )
                        )
                    )
                )
            );
    }

    function generateAttributes(
        string memory fileType,
        string memory fileDescription,
        uint256 fileSize,
        uint256 filePrice
    ) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type": "Category", "value": "',
                    fileType,
                    '"},{"trait_type": "Description", "value": "',
                    fileDescription,
                    '"},{"trait_type": "File Size", "value": "',
                    Strings.toString(fileSize),
                    '"},{"trait_type": "File Price", "value": "',
                    Strings.toString(filePrice),
                    '"}'
                )
            );
    }

    function generateImage(uint256 fileId) public view returns (string memory) {
        string memory fileImage_ = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">',
                '<text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" font-size="24" font-family="Arial" font-weight="bold" fill="#F36E31">FileBlox</text>',
                '<text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="12" font-family="Arial" font-weight="bold" fill="#5b5b5b">',
                Strings.toString(_fileIds[fileId]),
                "</text></svg>"
            )
        );

        return string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(fileImage_))));
    }

    function getTokensOwnedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _tokenIds.current();
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (ownerOf(tokenId) != msg.sender) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }

    function getTokenCreatorById(uint256 tokenId) external view returns (address) {
        return _creators[tokenId];
    }

    function getFileIdByTokenId(uint256 tokenId) external view returns (uint256) {
        return _fileIds[tokenId];
    }

    function getTokensCreatedByMe() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = _tokenIds.current();
        uint256 numberOfTokensCreated = 0;

        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (_creators[tokenId] != msg.sender) continue;
            numberOfTokensCreated += 1;
        }

        uint256[] memory createdTokenIds = new uint256[](numberOfTokensCreated);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < numberOfExistingTokens; i++) {
            uint256 tokenId = i + 1;
            if (_creators[tokenId] != msg.sender) continue;
            createdTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return createdTokenIds;
    }
}
