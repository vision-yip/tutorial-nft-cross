const { task } = require('hardhat/config');


task('check-wnft').setAction(async(taskArgs, hre) => {
  const { firstAccount } = await getNamedAccounts();
  const wnft = await ethers.getContract('WrappedMyToken', firstAccount);

  const totalSupply = await wnft.totalSupply();

  console.log('checking status of MyToken');
  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    const owner = await wnft.ownerOf(tokenId);
    console.log(`tokenId: ${tokenId} - owner: ${owner}`);
    
  }
});

module.exports = {};