const { task } = require('hardhat/config');
const { networkConfig } = require('../helper-hardhat-config');

task('burn-and-cross')
  .addOptionalParam('chainselector', 'chain seletor of dest chain')
  .addOptionalParam('receiver', 'receiver address on dest chain')
  .addParam('tokenid', 'token ID to be crossed chain')
  .setAction(async(taskArgs, hre) => {
    const chainId = network.config.chainId;
    const chainSelector =
      taskArgs.chainselector || networkConfig[chainId].companionChainSelector;
    const nftLockAndRelease = await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease")
    const receiver =
      taskArgs.receiver || nftLockAndRelease.address;
    const tokenId = taskArgs.tokenid;
    const { firstAccount } = await getNamedAccounts();

    // tansfer link token to address of the pool
    const linTokenAddress = networkConfig[chainId].linkToken;
    const linkToken = await ethers.getContractAt('LinkToken', linTokenAddress);
    const nftPoolBurnAndMint = await ethers.getContract('NFTPoolBurnAndMint', firstAccount);
    const transferTx = await linkToken.transfer(nftPoolBurnAndMint.target, ethers.parseEther('2'));
    await transferTx.wait(5);
    const balance = await linkToken.balanceOf(nftPoolBurnAndMint.target);
    console.log(`balance of pool is ${balance}`);
    
    // // approve pool address to call transferFrom
    const wnft = await ethers.getContract('WrappedMyToken', firstAccount);
    await wnft.approve(nftPoolBurnAndMint.target, tokenId);
    console.log('approve successfully');

    // call lockAndSendNFT
    console.log(tokenId, firstAccount, chainSelector, receiver);
    
    const burnAndSendNFTtx = await nftPoolBurnAndMint.burnAndSendNFT(tokenId, firstAccount, chainSelector, receiver);
    console.log(`ccip transaction is sent, the tx hash is ${burnAndSendNFTtx.hash}`);
});

module.exports = {};