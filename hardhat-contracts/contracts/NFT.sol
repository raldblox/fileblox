// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private marketplaceAddress;
    address private registryAddress;

    mapping(uint256 => address) private _creators;
    mapping(uint256 => uint256) private _fileIds;

    event TokenMinted(uint256 indexed tokenId, uint256 fileId, address marketplaceAddress);

    constructor(
        address _marketplaceAddress,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC721(_tokenName, _tokenSymbol) {
        marketplaceAddress = _marketplaceAddress;
        registryAddress = msg.sender;
    }

    // Modifier to check that the caller is the File Registry Contract
    modifier onlyRegistry() {
        require(msg.sender == registryAddress, "Not owner");
        _;
    }

    function mintToken(uint256 fileId, address _owner) public onlyRegistry returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
        _mint(_owner, newItemId);
        _creators[newItemId] = _owner;
        _fileIds[newItemId] = fileId;

        // Give the marketplace approval to transact NFTs between users
        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(newItemId, fileId, marketplaceAddress);
        return newItemId;
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
