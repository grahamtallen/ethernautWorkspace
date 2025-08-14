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
  it("Measure GateOne offset without editing GatekeeperOne", async () => {
    const offsetBN = await deployedGatekeeperOneHacker.callStatic.measureGateOneOffset();
    const offset = offsetBN.toNumber();
    console.log("Measured GateOne offset (gas used in proxy call):", offset);
});
    it("Gate 1, 2, and 3 via hacker contract (EIP-150 adjusted with delta window)", async () => {
        const [wallet] = await ethers.getSigners();
        const key = await deployedGatekeeperOneHacker.getDerivedKey(wallet.address); // bytes8 key

        const base = 8191;
        const startK = 10;
        const endK = 50;
        const deltaWindow = 10; // +/- gas delta around target for forgiving search

        let passed = false;
        let successfulGasLimit;

        // Measure overhead offset from proxy + gateOne
        let offset = await deployedGatekeeperOneHacker.callStatic.measureGateOneOffset();
        offset = offset.toNumber();
        console.log("Measured offset:", offset);

        for (let k = startK; k <= endK; k++) {
            for (let delta = -deltaWindow; delta <= deltaWindow; delta++) {
                const adjustedTarget = base * k + offset + delta;
                const gasLimit = Math.floor((adjustedTarget * 64) / 63); // EIP-150 adjustment

                try {
                    const tx = await deployedGatekeeperOneHacker
                        .connect(wallet)
                        .callEnter(key, gasLimit, { gasLimit: 1_000_000 }); // outer tx limit
                    const receipt = await tx.wait();
                    console.log(`✅ Success! k=${k}, delta=${delta}, internal target=${adjustedTarget}, sent gas=${gasLimit}`);
                    console.log("Transaction hash:", receipt.hash);

                    successfulGasLimit = gasLimit;
                    passed = true;
                    break; // stop inner delta loop
                } catch (err) {
                    // log for debugging
                    if (k % 5 === 0) {
                      const reason = err?.error?.message || err?.reason || err?.toString();
                      console.log(`❌ Attempt k=${k}, delta=${delta} failed`, { adjustedTarget, gasLimit, reason });
                    }
                }
            }

            if (passed) break; // stop outer k loop
        }

        expect(passed).to.equal(true);
        console.log({ successfulGasLimit });
    });

});