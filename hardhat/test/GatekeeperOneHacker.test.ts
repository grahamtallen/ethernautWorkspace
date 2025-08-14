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

    const startK = 1;
    const endK = 50;
    const deltaWindow = 5; // +/- gas delta around target for forgiving search

    let passed = false;
    let successfulGasLimit: number | undefined;
    const base = 8191;
    const offset = 150; // empirical proxy+Gate1
    const k = 50;



    outer:
    for (let k = startK; k <= endK; k++) {
      for (let delta = -deltaWindow; delta <= deltaWindow; delta++) {
        const raw = base * k + offset;
        const delta = (8191 - (raw % 8191)) % 8191;
        const adjustedTarget = raw + delta;
        const gasLimit = Math.floor((adjustedTarget * 64) / 63);
        // Calculate the internal gas target for Gate 2
        console.log("gasLeft mod 8191:", adjustedTarget % 8191);
        console.log({ raw, delta, adjustedTarget, gasLimit });


        try {
          const tx = await hacker
            .connect(wallet)
            .callEnter(key, gasLimit, { gasLimit: 1_000_000 });
          const receipt = await tx.wait();

          console.log(`✅ Success! k=${k}, delta=${delta}, internal target=${adjustedTarget}, sent gas=${gasLimit}`);
          console.log("Transaction hash:", receipt?.hash);

          successfulGasLimit = gasLimit;
          passed = true;
          break outer; // stop both loops
        } catch (err: any) {
          const reason = err?.error?.message || err?.reason || err?.toString();
          // Only log occasionally to avoid spamming
          if (k % 5 === 0) {
            console.log(`❌ Attempt k=${k}, delta=${delta} failed`, { adjustedTarget, gasLimit, reason });
          }
        }
      }
    }

    expect(passed).to.equal(true);
    console.log({ successfulGasLimit });
  });



});