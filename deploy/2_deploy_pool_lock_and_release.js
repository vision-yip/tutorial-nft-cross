const { getNamedAccounts, network } = require('hardhat');
const { developmentChains, networkConfig } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;
  log('NFTPoolLockAndRelease deploying...');

  let sourceChainRouter
  let linkTokenAddr

  // address _router, address _link, address nftAddr
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get('CCIPLocalSimulator');
    const ccipSimulator = await ethers.getContractAt('CCIPLocalSimulator', ccipSimulatorDeployment.address);
    const ccipConfig = await ccipSimulator.configuration();
    sourceChainRouter = ccipConfig.sourceRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    const { router, linkToken } = networkConfig[network.config.chainId];
    sourceChainRouter = router;
    linkTokenAddr = linkToken;
  }

  const nftDeployment = await deployments.get('MyToken');
  const nftAddr = nftDeployment.address;

  await deploy('NFTPoolLockAndRelease', {
    contarct: 'NFTPoolLockAndRelease',
    from: firstAccount,
    log: true,
    args: [sourceChainRouter, linkTokenAddr, nftAddr]
  });

  log('NFTPoolLockAndRelease deployed successfully');
};

module.exports.tags = ['sourcechain', 'all']