import { ethers} from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PayToWin__factory, PayToWin } from "../typechain";
import { Address } from "cluster";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("PayToWin", () => {
  let payToWin: PayToWin;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async () => {
    // 1
    [owner, addr1, addr2] = await ethers.getSigners();

    // 2
    const payToWinFactory = (await ethers.getContractFactory(
      "PayToWin",
      owner
    )) as PayToWin__factory;
    payToWin = await payToWinFactory.deploy();
    await payToWin.deployed();

    const initialCount = await payToWin.getPlayerCount();

    // 3
    expect(initialCount).to.eq(0);
    expect(payToWin.address).to.properAddress;
  });

  // 4
  describe("pay", async () => {
    it("should be able to pay", async () => {
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});
      let count = await payToWin.getPlayerCount();
      expect(count).to.eq(1);
    });
    it("should be able to pay 2 times", async () => {
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});
      await payToWin.connect(addr2).pay("MAN", {value: ethers.utils.parseEther("0.1")});

      let count = await payToWin.getPlayerCount();
      expect(count).to.eq(2);
    });
    it("should be able to pay twice", async () => {
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});
      await payToWin.connect(addr2).pay("MAN", {value: ethers.utils.parseEther("0.1")});
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});

      let count = await payToWin.getPlayerCount();
      expect(count).to.eq(2);
    });
  });

  describe("getPosition", async () => {
    it("should be able to pay", async () => {
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});
      await payToWin.connect(addr2).pay("MAN", {value: ethers.utils.parseEther("0.2")});

      let [position, playerData] = await payToWin.connect(addr1).areYouWinningSon();
      expect(position).to.eq(2);
      expect(playerData.score).to.eq(ethers.utils.parseEther("0.1"));
      expect(playerData.name).to.eq("DUDE");
    });
  });

  describe("getUnsortedLeaderboard", async () => {
    it("should return a right-sized array", async () => {
      await payToWin.connect(addr1).pay("DUDE", {value: ethers.utils.parseEther("0.1")});
      let players = await payToWin.getUnsortedLeaderboard();
      expect(players.length == 1);
    });
  });
});
