pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract PayToWin {
    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    struct Player {
        string name;
        uint score;
    }

    mapping (address => Player) private players; // address to player, not enumerable
    Counters.Counter private playerCount;
    EnumerableMap.UintToAddressMap private playerMap; // id to address, enumerable

    event NewScore(address who, uint256 score);

    function pay(string memory name) payable public {
        Player storage player = players[msg.sender];

        // new player
        if (player.score == 0) {
            playerMap.set(playerCount.current(), msg.sender);
            playerCount.increment();
        }

        player.score = player.score + msg.value;
        if (keccak256(abi.encodePacked((player.name))) != keccak256(abi.encodePacked((name)))) {
            player.name = name;
        }
    }

    function getPosition(address ad) private view returns (uint) {
        uint256 playerScore = players[ad].score;
        uint256 playersAhead;

        for (uint256 i = 0; i < playerCount.current(); i++) {
            address otherAddress = playerMap.get(i, "failed to find player id");
            if (ad == otherAddress) {
                continue;
            }

            if (players[otherAddress].score > playerScore) {
                playersAhead++;
            }
        }

        uint position = playersAhead+1; // one more to get position 1 instead of 0

        return position;
    }

    function areYouWinningSon() external view returns (uint position, Player memory) {
        position = getPosition(msg.sender);
        return (position, players[msg.sender]);
    }

    function getUnsortedLeaderboard() external view returns (Player[] memory playerList) {
        playerList = new Player[](playerCount.current());
        for (uint256 i = 0; i < playerCount.current(); i++) {
            address ad = playerMap.get(i, "failed to find player id");
            playerList[i] = players[ad];
        }
        return playerList;
    }

    function getPlayerCount() external view returns (uint256) {
        return playerCount.current();
    }
}