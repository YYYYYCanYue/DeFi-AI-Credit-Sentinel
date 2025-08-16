// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract CreditScoreBadge is ERC721, Ownable, EIP712 {
    using Strings for uint256;

    // ============ 结构/存储 ============

    struct Tier {
        uint256 minScore;     // 达到该阶段所需的最低分
        string uri;           // 该阶段的 tokenURI（通常为 ipfs:// 或 https://）
        bool exists;          // 阶段是否已配置
    }

    // EIP-712 结构体：用于后端签名
    struct ClaimRequest {
        address to;           // 用户地址
        uint256 score;        // 后端认定的当前信用分
        uint8 tierId;         // 建议发放/升级到的阶段
        uint256 nonce;        // 防重放
        uint256 deadline;     // 截止时间（时间戳，秒）
    }

    // 链上可配置的阶段信息
    mapping(uint8 => Tier) private _tiers;
    uint8[] private _tierIds; // 用于遍历/前端查询

    // 用户 => tokenId（每地址最多 1 个 NFT）
    mapping(address => uint256) public tokenOf;

    // tokenId => 当前阶段 & 元数据
    mapping(uint256 => uint8) public tierOf;
    mapping(uint256 => uint256) public lastScoreOf;   // 最近一次链上确认的分数
    mapping(uint256 => uint256) public mintedAt;
    mapping(uint256 => uint256) public updatedAt;

    // 防重放：地址 => nonce => 是否已使用
    mapping(address => mapping(uint256 => bool)) public usedNonce;

    // 背书签名者（后端/风控服务公钥）
    address public signer;

    // SBT（灵魂绑定）模式：禁止转让（仅允许 mint/burn）
    bool public immutable soulbound;

    // 递增 tokenId 计数
    uint256 private _nextTokenId = 1;

    // EIP-712 常量
    string private constant SIGNING_DOMAIN = "CreditScoreBadge";
    string private constant SIGNATURE_VERSION = "1";
    bytes32 private constant _CLAIM_TYPEHASH = keccak256(
        "ClaimRequest(address to,uint256 score,uint8 tierId,uint256 nonce,uint256 deadline)"
    );

    // 事件
    event SignerUpdated(address indexed newSigner);
    event TierSet(uint8 indexed tierId, uint256 minScore, string uri);
    event Claimed(address indexed to, uint256 indexed tokenId, uint8 tierId, uint256 score);
    event Upgraded(address indexed to, uint256 indexed tokenId, uint8 fromTier, uint8 toTier, uint256 score);
    event Burned(address indexed owner, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        address signer_,
        bool soulbound_
    ) ERC721(name_, symbol_) Ownable(owner_) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        require(signer_ != address(0), "signer=0");
        signer = signer_;
        soulbound = soulbound_;
    }

    // ============ 管理员：配置阶段 ============

    function setTier(uint8 tierId, uint256 minScore, string calldata uri) external onlyOwner {
        require(minScore > 0, "minScore=0");
        require(bytes(uri).length > 0, "empty uri");
        if (!_tiers[tierId].exists) {
            _tierIds.push(tierId);
        }
        _tiers[tierId] = Tier({minScore: minScore, uri: uri, exists: true});
        emit TierSet(tierId, minScore, uri);
    }

    function getTier(uint8 tierId) external view returns (Tier memory) {
        require(_tiers[tierId].exists, "tier !exist");
        return _tiers[tierId];
    }

    function listTiers() external view returns (uint8[] memory ids, Tier[] memory tiers) {
        ids = _tierIds;
        tiers = new Tier[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            tiers[i] = _tiers[ids[i]];
        }
    }

    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "signer=0");
        signer = newSigner;
        emit SignerUpdated(newSigner);
    }

    // ============ 用户：申领/升级 （EIP-712） ============

    /**
     * claimOrUpgrade
     * - 若用户无 NFT：铸造并设置到请求的阶段
     * - 若用户已有 NFT：仅当请求阶段更高时升级
     * 参数：
     * - req: 后端签名的 ClaimRequest
     * - signature: ECDSA 签名
     */
    function claimOrUpgrade(ClaimRequest calldata req, bytes calldata signature) external {
        require(block.timestamp <= req.deadline, "expired");
        require(req.to == msg.sender, "only self");
        require(!usedNonce[req.to][req.nonce], "nonce used");
        require(_tiers[req.tierId].exists, "tier !exist");
        require(req.score >= _tiers[req.tierId].minScore, "score < tier");

        // 校验签名
        bytes32 structHash = keccak256(abi.encode(
            _CLAIM_TYPEHASH,
            req.to,
            req.score,
            req.tierId,
            req.nonce,
            req.deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == signer, "bad sig");

        usedNonce[req.to][req.nonce] = true;

        uint256 tokenId = tokenOf[req.to];
        if (tokenId == 0) {
            // 首次铸造
            tokenId = _nextTokenId++;
            tokenOf[req.to] = tokenId;
            tierOf[tokenId] = req.tierId;
            lastScoreOf[tokenId] = req.score;
            mintedAt[tokenId] = block.timestamp;
            updatedAt[tokenId] = block.timestamp;
            _safeMint(req.to, tokenId);
            emit Claimed(req.to, tokenId, req.tierId, req.score);
        } else {
            // 升级（仅当更高阶段）
            uint8 cur = tierOf[tokenId];
            require(req.tierId > cur, "not higher tier");
            tierOf[tokenId] = req.tierId;
            lastScoreOf[tokenId] = req.score;
            updatedAt[tokenId] = block.timestamp;
            emit Upgraded(req.to, tokenId, cur, req.tierId, req.score);
        }
    }

    // ============ 销毁 ============
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        _burn(tokenId);
        emit Burned(msg.sender, tokenId);
        // 清理引用
        if (tokenOf[msg.sender] == tokenId) {
            tokenOf[msg.sender] = 0;
        }
        delete tierOf[tokenId];
        delete lastScoreOf[tokenId];
        delete mintedAt[tokenId];
        delete updatedAt[tokenId];
    }

    // ============ 元数据：按阶段返回 ============
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "!exists");
        uint8 t = tierOf[tokenId];
        Tier memory tier = _tiers[t];
        return tier.uri; // 简化：不同阶段返回不同固定 URI；若需动态 JSON，可在此拼装 Base64 JSON。
    }

    // ============ SBT 灵魂绑定附魔（禁止转让） ============
    error NonTransferable();

    /**
     * OZ v5 的 _update 钩子：
     * - from==address(0) => mint
     * - to==address(0) => burn
     * - 其余为正常转移，SBT 模式下禁止
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (soulbound) {
            address from = _ownerOf(tokenId);
            if (from != address(0) && to != address(0)) revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    // ============ 辅助只读 ============
    function currentTier(address user) external view returns (bool has, uint8 tierId, uint256 score, uint256 tokenId) {
        tokenId = tokenOf[user];
        if (tokenId == 0) return (false, 0, 0, 0);
        return (true, tierOf[tokenId], lastScoreOf[tokenId], tokenId);
    }
}
