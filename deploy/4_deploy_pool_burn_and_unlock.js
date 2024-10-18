const { getNamedAccounts, network } = require('hardhat');
const { developmentChains, networkConfig } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log('NFTPoolBurnAndMint deploying...');

  let destChainRouter
  let linkTokenAddr
  // address _router, address _link, address nftAddr
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get('CCIPLocalSimulator');
    const ccipSimulator = await ethers.getContractAt('CCIPLocalSimulator', ccipSimulatorDeployment.address);
    const ccipConfig = await ccipSimulator.configuration();
    destChainRouter = ccipConfig.destinationRouter_;
    linkTokenAddr = ccipConfig.linkToken_;
  } else {
    const { router, linkToken } = networkConfig[network.config.chainId];
    destChainRouter = router;
    linkTokenAddr = linkToken;
  }

  const wnftDeployment = await deployments.get('WrappedMyToken');
  const wnftAddr = wnftDeployment.address;

  await deploy('NFTPoolBurnAndMint', {
    contarct: 'NFTPoolBurnAndMint',
    from: firstAccount,
    log: true,
    args: [destChainRouter, linkTokenAddr, wnftAddr]
  });

  log('NFTPoolBurnAndMint deployed successfully');
};

module.exports.tags = ['destchain', 'all'];