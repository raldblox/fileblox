// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Ape is ERC20 {
    constructor(
    ) ERC20("APETEST", "APE") {
        uint256 initialSupply = 1000000 * 10**18; // 1,000,00
        _mint(msg.sender, initialSupply);
    }

}