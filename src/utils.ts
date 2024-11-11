import { Signal } from "solid-js"
import { Product } from "./products"

const formatPrice = (price: number) => {
	return (price + "").replace(/\d(?=(?:\d\d\d)+$)/g, "$& ") + ",00"
}

const map: Record<string, string> = {
  "D": "m42 250h108v-218h-95",
  "M": "m42 250h108v-98h105",
  "R": "m42 250h108v-158h75",
  "DM": "m42 250h108v-218h-95m95 120h105",
  "DR": "m42 250h108v-218h-95m95 60h75",
  "MR": "m42 250h108v-98h105m-105 0v-60h75",
  "DMR": "m42 250h108v-98h105m-105 0v-60h75m-75 0v-60h-95",
}

const getRoute = (cart: [Product, Signal<string>][]) => {
  return map[cart.map(p => p[0].name[0]).sort().join("")] || ""
}

export { formatPrice, getRoute }
