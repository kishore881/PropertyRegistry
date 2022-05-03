pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract LandRegistry is ERC721Enumerable, AccessControl {
    string private baseURI = 'ipfs/';
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant REGISTRAR = keccak256("REGISTRAR");
    mapping(uint256 => string) cid;
    using Counters for Counters.Counter;
    Counters.Counter counter;
  
    constructor() ERC721("Land Registry", "LREG"){
        _setupRole(ADMIN, msg.sender);
        _setRoleAdmin(ADMIN, ADMIN);
        _setRoleAdmin(REGISTRAR, ADMIN);
        grantRole(REGISTRAR, msg.sender);
    }

    function addRegistrar(address account) public onlyRole(ADMIN){
        grantRole(REGISTRAR, account);
    }
    function removeRegistrar(address account) public onlyRole(ADMIN){
        revokeRole(REGISTRAR, account);
    }

    function addAdmin(address account) public onlyRole(ADMIN){
        grantRole(ADMIN, account);
    }

    function removeAdmin(address account) public onlyRole(ADMIN){
        revokeRole(ADMIN, account);
    }

    function setBaseURI(string memory _URI) public onlyRole(ADMIN){
        baseURI = _URI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function register(address to, string memory IPFS_CID) public onlyRole(REGISTRAR){
        require(to != address(0x0));
        uint256 idx = counter.current();
        counter.increment();
        cid[idx] = IPFS_CID;
        _safeMint(to, idx);
    }

    function getMeta(uint256 index) public view returns(string memory) {
        return cid[index];
    }
    
    function supportsInterface(bytes4 _interfaceId) public view virtual override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(_interfaceId);
    }

}
