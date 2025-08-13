/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GatekeeperOne", function () {
  it("test initial value", async function () {
    const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
    const gatekeeperOne = await GatekeeperOne.deploy();
    await gatekeeperOne.deployed();
    console.log("gatekeeperOne deployed at:" + gatekeeperOne.address);
    const result = await gatekeeperOne.entrant();
    expect(result).to.equal('0x0000000000000000000000000000000000000000');
  });
});