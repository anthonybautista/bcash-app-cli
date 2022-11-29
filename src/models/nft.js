import {getPapilioContract} from "@/utils/contract";

function NFT(tokenId, pic, staked) {
    this.tokenId = tokenId;
    this.pic = pic;
    this.staked = staked ?? false;
}

NFT.getURI = async function (token) {
    let contract = getPapilioContract();
    return await contract.tokenURI(token);
}


export default NFT;