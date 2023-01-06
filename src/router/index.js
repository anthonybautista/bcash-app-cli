import { createWebHistory, createRouter } from "vue-router";
import VeContainer from "@/views/VeContainer.vue";
import LpContainer from "@/components/LpContainer";
import AutoLpContainer from "@/views/AutoLpContainer";
import StakeContainer from "@/views/StakeContainer";
import SwapContainer from "@/views/SwapContainer";

const routes = [
    {
        path: "/",
        name: "Swap",
        component: SwapContainer,
    },
    {
        path: "/ve",
        name: "Ve",
        component: VeContainer,
    },
    {
        path: "/farm",
        name: "Farm",
        component: LpContainer,
    },
    {
        path: "/auto",
        name: "Auto",
        component: AutoLpContainer,
    },
    {
        path: "/stake",
        name: "Stake",
        component: StakeContainer,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;