import { expect } from "chai";
import { ethers } from "hardhat";
import { TicketNFT, SystemToken, Marketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFT Ticketing System", function () {
  let ticketNFT: TicketNFT;
  let systemToken: SystemToken;
  let marketplace: Marketplace;
  let owner: SignerWithAddress;
  let organizer: SignerWithAddress;
  let buyer: SignerWithAddress;
  let buyer2: SignerWithAddress;

  const EVENT_ID = 1;
  const TEMPLATE_ID = 1;
  const TICKET_PRICE = ethers.parseEther("10");
  const ROYALTY_FEE = 500; // 5%

  beforeEach(async function () {
    [owner, organizer, buyer, buyer2] = await ethers.getSigners();

    // Deploy SystemToken
    const SystemToken = await ethers.getContractFactory("SystemToken");
    systemToken = await SystemToken.deploy("Ticket Token", "TKT", 1000000);
    await systemToken.waitForDeployment();

    // Deploy TicketNFT
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFT.deploy();
    await ticketNFT.waitForDeployment();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await ticketNFT.getAddress(),
      await systemToken.getAddress()
    );
    await marketplace.waitForDeployment();

    // Setup: Give buyer some tokens
    await systemToken.transfer(buyer.address, ethers.parseEther("1000"));
    await systemToken.transfer(buyer2.address, ethers.parseEther("1000"));

    // Grant MINTER_ROLE to owner
    const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
    await ticketNFT.grantRole(MINTER_ROLE, owner.address);
  });

  describe("SystemToken", function () {
    it("Should deploy with correct initial supply", async function () {
      const totalSupply = await systemToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should allow faucet claims", async function () {
      const amount = ethers.parseEther("100");
      await systemToken.connect(buyer).faucet(amount);
      
      const balance = await systemToken.balanceOf(buyer.address);
      expect(balance).to.be.gte(amount);
    });

    it("Should not allow faucet claim over limit", async function () {
      const amount = ethers.parseEther("2000");
      await expect(
        systemToken.connect(buyer).faucet(amount)
      ).to.be.revertedWith("Maximum 1000 tokens per claim");
    });
  });

  describe("TicketNFT", function () {
    it("Should create an event", async function () {
      await ticketNFT.connect(organizer).createEvent(
        EVENT_ID,
        "Test Event",
        ROYALTY_FEE
      );

      const eventInfo = await ticketNFT.getEventInfo(EVENT_ID);
      expect(eventInfo.name).to.equal("Test Event");
      expect(eventInfo.organizer).to.equal(organizer.address);
      expect(eventInfo.royaltyFee).to.equal(ROYALTY_FEE);
      expect(eventInfo.isActive).to.be.true;
    });

    it("Should mint a ticket", async function () {
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Test Event", ROYALTY_FEE);

      await ticketNFT.mintTicket(
        buyer.address,
        EVENT_ID,
        TEMPLATE_ID,
        "ipfs://test-uri",
        false // not soulbound
      );

      const balance = await ticketNFT.balanceOf(buyer.address);
      expect(balance).to.equal(1);

      const ticketInfo = await ticketNFT.getTicketInfo(0);
      expect(ticketInfo.eventId).to.equal(EVENT_ID);
      expect(ticketInfo.templateId).to.equal(TEMPLATE_ID);
      expect(ticketInfo.isCheckedIn).to.be.false;
    });

    it("Should prevent transfer of soulbound ticket", async function () {
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Test Event", ROYALTY_FEE);

      await ticketNFT.mintTicket(
        buyer.address,
        EVENT_ID,
        TEMPLATE_ID,
        "ipfs://test-uri",
        true // soulbound
      );

      await expect(
        ticketNFT.connect(buyer).transferFrom(buyer.address, buyer2.address, 0)
      ).to.be.revertedWith("Token is soulbound and cannot be transferred");
    });

    it("Should allow check-in by organizer", async function () {
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Test Event", ROYALTY_FEE);
      await ticketNFT.mintTicket(buyer.address, EVENT_ID, TEMPLATE_ID, "ipfs://test-uri", false);

      await ticketNFT.connect(organizer).checkIn(0);

      const ticketInfo = await ticketNFT.getTicketInfo(0);
      expect(ticketInfo.isCheckedIn).to.be.true;
    });

    it("Should not allow duplicate check-in", async function () {
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Test Event", ROYALTY_FEE);
      await ticketNFT.mintTicket(buyer.address, EVENT_ID, TEMPLATE_ID, "ipfs://test-uri", false);

      await ticketNFT.connect(organizer).checkIn(0);

      await expect(
        ticketNFT.connect(organizer).checkIn(0)
      ).to.be.revertedWith("Already checked in");
    });
  });

  describe("Marketplace", function () {
    let tokenId: number;

    beforeEach(async function () {
      // Setup event and mint ticket
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Test Event", ROYALTY_FEE);
      await ticketNFT.mintTicket(buyer.address, EVENT_ID, TEMPLATE_ID, "ipfs://test-uri", false);
      tokenId = 0;

      // Approve marketplace to handle NFT
      await ticketNFT.connect(buyer).approve(await marketplace.getAddress(), tokenId);
    });

    it("Should list a ticket for sale", async function () {
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);

      const listing = await marketplace.listings(tokenId);
      expect(listing.isActive).to.be.true;
      expect(listing.seller).to.equal(buyer.address);
      expect(listing.price).to.equal(TICKET_PRICE);

      // NFT should be transferred to marketplace
      expect(await ticketNFT.ownerOf(tokenId)).to.equal(await marketplace.getAddress());
    });

    it("Should unlist a ticket", async function () {
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);
      await marketplace.connect(buyer).unlist(tokenId);

      const listing = await marketplace.listings(tokenId);
      expect(listing.isActive).to.be.false;

      // NFT should be returned to seller
      expect(await ticketNFT.ownerOf(tokenId)).to.equal(buyer.address);
    });

    it("Should allow buying a listed ticket", async function () {
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);

      // Buyer2 approves tokens and buys
      await systemToken.connect(buyer2).approve(await marketplace.getAddress(), TICKET_PRICE);
      await marketplace.connect(buyer2).buy(tokenId);

      // NFT should be transferred to buyer2
      expect(await ticketNFT.ownerOf(tokenId)).to.equal(buyer2.address);

      // Listing should be inactive
      const listing = await marketplace.listings(tokenId);
      expect(listing.isActive).to.be.false;
    });

    it("Should distribute fees correctly on sale", async function () {
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);

      const sellerBalanceBefore = await systemToken.balanceOf(buyer.address);
      
      await systemToken.connect(buyer2).approve(await marketplace.getAddress(), TICKET_PRICE);
      await marketplace.connect(buyer2).buy(tokenId);

      const sellerBalanceAfter = await systemToken.balanceOf(buyer.address);
      const received = sellerBalanceAfter - sellerBalanceBefore;

      // Seller should receive less than full price due to fees
      expect(received).to.be.lt(TICKET_PRICE);
      expect(received).to.be.gt(0);
    });

    it("Should not allow seller to buy own listing", async function () {
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);

      await systemToken.connect(buyer).approve(await marketplace.getAddress(), TICKET_PRICE);
      
      await expect(
        marketplace.connect(buyer).buy(tokenId)
      ).to.be.revertedWith("Cannot buy own listing");
    });
  });

  describe("Integration: Full Flow", function () {
    it("Should complete full ticket lifecycle", async function () {
      // 1. Create event
      await ticketNFT.connect(organizer).createEvent(EVENT_ID, "Concert", ROYALTY_FEE);

      // 2. Mint ticket
      await ticketNFT.mintTicket(buyer.address, EVENT_ID, TEMPLATE_ID, "ipfs://uri", false);
      const tokenId = 0;

      // 3. List on marketplace
      await ticketNFT.connect(buyer).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(buyer).list(tokenId, TICKET_PRICE);

      // 4. Buy ticket
      await systemToken.connect(buyer2).approve(await marketplace.getAddress(), TICKET_PRICE);
      await marketplace.connect(buyer2).buy(tokenId);

      // 5. Check-in
      await ticketNFT.connect(organizer).checkIn(tokenId);

      // Verify final state
      expect(await ticketNFT.ownerOf(tokenId)).to.equal(buyer2.address);
      const ticketInfo = await ticketNFT.getTicketInfo(tokenId);
      expect(ticketInfo.isCheckedIn).to.be.true;
    });
  });
});
