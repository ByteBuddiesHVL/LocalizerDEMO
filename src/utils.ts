import { Signal } from "solid-js"
import { Product, products } from "./products"

const formatPrice = (price: number) => {
	return (price + "").replace(/\d(?=(?:\d\d\d)+$)/g, "$& ") + ",00"
}

const map: Record<string, string> = {
  D: "m42 250h108v-218h-95",
  M: "m42 250h108v-98h105",
  R: "m42 250h108v-158h75",
  DM: "m42 250h108v-218h-95m95 120h105",
  DR: "m42 250h108v-218h-95m95 60h75",
  MR: "m42 250h108v-98h105m-105 0v-60h75",
  DMR: "m42 250h108v-98h105m-105 0v-60h75m-75 0v-60h-95",
}

const getRoute = (cart: [Product, Signal<string>][]) => {
  return map[cart.map(p => p[0].name[0]).sort().join("")] || ""
}

const letter = /\p{L}/u

const filterProducts = (query: string) => {
  const len = query.length
  const result: [number, Product][] = []
  if (!len) return null

  products.forEach(prod => {
    let name = prod.name.toLowerCase()

    if (len == 1) {
      if (name[0] == query) result.push([0, prod])
    } else {
      let desc = prod.description.toLowerCase()
      let score = 0
      let index = name.indexOf(query)
      let scale = index + 1 ? 1 : 5
      if (index < 0) index = desc.indexOf(query)
      if (index + 1) {
        score -= index
        if (index) {
          score -= 10 * scale
          if (letter.test(name[index - 1])) score -= 50 * scale
        }
        if (letter.test(name[index + len] || "")) score -= 50 * scale
        result.push([score, prod])
      }
    }
  })

  return result.sort((a, b) => b[0] - a[0]).map(p => p[1])
}

export { formatPrice, getRoute, filterProducts }
