import papilioABI from '../config/abi/papilio.json';
import vecashABI from '../config/abi/vecash.json';
import fireABI from '../config/abi/fire.json';
import bcashABI from '../config/abi/bcash.json';
import farmABI from '../config/abi/farm.json';
import pglABI from '../config/abi/pgl.json';
import autoABI from '../config/abi/auto.json';
import sbCashABI from '../config/abi/sbCash.json';
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

export const getVecashContractNoSigner = () => {
    return getContract(vecashABI, "0x04Ee75e533622E8C24D463588d83a310c21fEE3F");
}

export const getFireContract = () => {
    return getContract(fireABI, "0x5adCD28C08Fdc5a913982391cebD866b27C717D4");
}

export const getBcashContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(bcashABI, "0x4BA16DaF8ed418deD920C66e45cc3eaFFDE53Ac7", signer);
}

export const getBcashContractNoSigner = () => {
    return getContract(bcashABI, "0x4BA16DaF8ed418deD920C66e45cc3eaFFDE53Ac7");
}

export const getFarmContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(farmABI, "0x33B9da3bc122219C1B8ed484C6DB7f2D6c6d82C3", signer);
}

export const getFarmContractNoSigner = () => {
    return getContract(farmABI, "0x33B9da3bc122219C1B8ed484C6DB7f2D6c6d82C3");
}

export const getPglContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(pglABI, "0x07280f32830e3A1Ca7B535b603B09890e692EaF6", signer);
}

export const getPglContractNoSigner = () => {
    return getContract(pglABI, "0x07280f32830e3A1Ca7B535b603B09890e692EaF6");
}

export const getAutoContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(autoABI, "0xd5519F6B569aa07144Efc7265678A1Ec29D49E51", signer);
}

export const getAutoContractNoSigner = () => {
    return getContract(autoABI, "0xd5519F6B569aa07144Efc7265678A1Ec29D49E51");
}

export const getSbCashContract = () => {
    const {library} = store.state.web3Modal;
    const signer = library.getSigner();
    return getContract(sbCashABI, "0xa090463090EE99b8AbbBF8E6d0480CB5FDDDD1C6", signer);
}

export const getSbCashContractNoSigner = () => {
    return getContract(sbCashABI, "0xa090463090EE99b8AbbBF8E6d0480CB5FDDDD1C6");
}

const getContract = (abi, address, signer = null) => {
    const signerOrProvider = signer ?? simpleRpcProvider;
    return new ethers.Contract(address, abi, signerOrProvider);
}
