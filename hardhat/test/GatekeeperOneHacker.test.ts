/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
import { expect } from "chai";
import { network } from "hardhat";
import { GatekeeperOne } from "../types/ethers-contracts/GatekeeperOne.js";
import { GatekeeperOneHacker } from "../types/ethers-contracts/GatekeeperOneHacker.js";

const { ethers } = await network.connect();

describe("NetworkInfo", () => {
  it('logs network info', async () => {
    const network = await ethers.provider.getNetwork();
    console.log("Connected network:", network.name);
  })
})

describe("GatekeeperOneHacker", function () {
  let deployedGatekeeperOne: GatekeeperOne;
  let hacker: GatekeeperOneHacker;
  it("test initial value", async function () {
    const network = await ethers.provider.getNetwork();
    if (network.name === "default") {
      const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
      deployedGatekeeperOne = await GatekeeperOne.deploy();
      console.log("gatekeeperOne deployed at:" + await deployedGatekeeperOne.getAddress());
      const result = await deployedGatekeeperOne.entrant();
      expect(result).to.equal('0x0000000000000000000000000000000000000000');
    } else {
      // get already deployed target contract from: 0xBE55Cd6C38f47119DA10d13Ec9c3a7d149960eC3
      deployedGatekeeperOne = await ethers.getContractAt("GatekeeperOne", "0xBE55Cd6C38f47119DA10d13Ec9c3a7d149960eC3");
      console.log("gatekeeperOne deployed at:" + await deployedGatekeeperOne.getAddress());
      const result = await deployedGatekeeperOne.entrant();
      expect(result).to.equal('0x0000000000000000000000000000000000000000');
    }
  });
  it('deploys gatekeeper hacker', async () => {
    const GatekeeperOneHacker = await ethers.getContractFactory("GatekeeperOneHacker");
    hacker = await GatekeeperOneHacker.deploy(await deployedGatekeeperOne.getAddress());
    const trx = await hacker.deploymentTransaction()
    await trx?.wait();
    console.log("gatekeeperOneHacker deployed at:" + await hacker.getAddress());
    expect(await hacker.gasCostOfGateOne()).to.equal(140);
    const result = await hacker.gatekeeper();
    expect(await deployedGatekeeperOne.getAddress()).to.equal(result);
  })
  it('Gate 3 = checks key', async () => {
    const [wallet] = await ethers.getSigners();
    console.log("Wallet ", wallet.address, typeof wallet.address);
    const computedKey = await hacker.getDerivedKey(wallet.address);
    const result = await hacker.checkKey(computedKey, wallet.address);
    console.log("Computed key: ", computedKey, result);
    expect(result[0]).to.equal(true);
    expect(result[1]).to.equal(true);
    expect(result[2]).to.equal(true);
  })

  it.skip("Gate 1, 2, and 3 via hacker contract (EIP-150 adjusted with empirical offset)", async function () {
    this.timeout(420000);
    const [wallet] = await ethers.getSigners();
    const key = await hacker.getDerivedKey(wallet.address); // bytes8 key
    console.log("Wallet that should be entrant: ", wallet.address, key);
    let passed = false;
    let successfulGasLimit: number | undefined;

    // 205191 works in hardhat network
    const empiricalStart = 205190;
    const empiricalEnd = 205200;

    for (let gasLimit = empiricalStart; gasLimit <= empiricalEnd; gasLimit++) {
      if (passed) {
        break; // Exit loop if already successful
      }
      try {
        const tx = await hacker.connect(wallet).callEnter(key, gasLimit, { gasLimit: 1_000_000 });
        const receipt = await tx.wait();
        console.log("✅ Success!", { gasLimit });
        const entrant = await deployedGatekeeperOne.entrant();
        console.log("Entrant address:", entrant);
        expect(entrant).to.equal(wallet.address);
        passed = true;
        break;
      } catch (err) {
        const reason = err?.error?.message || err?.reason || err?.toString();
        // optional: log gasleft mod 8191 if you instrument the contract
      }
    }

    expect(passed).to.equal(true);
    console.log({ successfulGasLimit });
  });



});