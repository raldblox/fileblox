async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()));

    // Deploy FileRegistry Contract
    const FileRegistry = await ethers.getContractFactory("FileRegistry");
    const fileRegistry = await FileRegistry.deploy(deployer.address);
    await fileRegistry.deployed();
    console.log("File Registry:", fileRegistry.address);
    console.log("Token Address:", await fileRegistry.getTokenAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
