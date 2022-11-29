import papilioABI from '../config/abi/papilio.json';
import vecashABI from '../config/abi/vecash.json';
import fireABI from '../config/abi/fire.json';
import bcashABI from '../config/abi/bcash.json';
import {ethers} from "ethers";
import {simpleRpcProvider} from "@/utils/web3";
import store from '@/main';

export const getPapilioContract = () => {
    return getContract(papilioABI, "0xe80E87F412D2cC73045b73EF7e07A47ef0A41Cc0");
}

export const getVecashContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(vecashABI, "0x04Ee75e533622E8C24D463588d83a310c21fEE3F", signer);
}

export const getFireContract = () => {
    return getContract(fireABI, "0x5adCD28C08Fdc5a913982391cebD866b27C717D4");
}

export const getBcashContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(bcashABI, "0x4BA16DaF8ed418deD920C66e45cc3eaFFDE53Ac7", signer);
}

const getContract = (abi, address, signer = null) => {
    const signerOrProvider = signer ?? simpleRpcProvider;
    return new ethers.Contract(address, abi, signerOrProvider);
}
