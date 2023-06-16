async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()));

    // Deploy FileRegistry Contract
    const FileRegistry = await ethers.getContractFactory("FileRegistry");
    const fileRegistry = await FileRegistry.deploy("0x328507DC29C95c170B56a1b3A758eB7a9E73455c");
    await fileRegistry.deployed();
    console.log("File Registry:", fileRegistry.address);
    console.log("Token Address:", await fileRegistry.getTokenAddress());
    console.log("ERC20 Address:", await fileRegistry.getCurrencyAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
