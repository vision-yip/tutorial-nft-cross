const { task } = require('hardhat/config');
const { networkConfig } = require('../helper-hardhat-config');

task('lock-and-cross')
  .addOptionalParam('chainselector', 'chain seletor of dest chain')
  .addOptionalParam('receiver', 'receiver address on dest chain')
  .addParam('tokenid', 'token ID to be crossed chain')
  .setAction(async(taskArgs, hre) => {
    const chainId = network.config.chainId;
    const chainSelector =
      taskArgs.chainselector || networkConfig[chainId].companionChainSelector;
    const nftBurnAndMint = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
    const receiver =
      taskArgs.receiver || nftBurnAndMint.address;
    const tokenId = taskArgs.tokenid;
    const { firstAccount } = await getNamedAccounts();

    // tansfer link token to address of the pool
    const linTokenAddress = networkConfig[chainId].linkToken;
    const linkToken = await ethers.getContractAt('LinkToken', linTokenAddress);
    const nftPoolLockAndRelease = await ethers.getContract('NFTPoolLockAndRelease', firstAccount);
    const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther('2'));
    await transferTx.wait(5);
    const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target);
    console.log(`balance of pool is ${balance}`);
    
    // // approve pool address to call transferFrom
    const nft = await ethers.getContract('MyToken', firstAccount);
    await nft.approve(nftPoolLockAndRelease.target, tokenId);
    console.log('approve successfully');

    // call lockAndSendNFT
    console.log(tokenId, firstAccount, chainSelector, receiver);
    
    const lockAndSendNFTtx = await nftPoolLockAndRelease.lockAndSendNFT(tokenId, firstAccount, chainSelector, receiver);
    console.log(`ccip transaction is sent, the tx hash is ${lockAndSendNFTtx.hash}`);
});

module.exports = {};