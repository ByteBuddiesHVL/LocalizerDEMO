import { createMemo, createSignal, For, Show, type Component } from "solid-js"
import { Product, products } from "./products"

let allowDragging: boolean
const letter = /\p{L}/u
const cols = document.getElementsByClassName("col") as HTMLCollectionOf<HTMLElement>
const media = matchMedia("(max-aspect-ratio: 1 / 1)")

const updateWidth = (pos: number) => {
	const matches = media.matches
	const offset = Math.max(0, Math.min((100 * pos) / (matches ? innerHeight : innerWidth), 100))
	cols[0].style.flexBasis = offset + "%"
	cols[1].style.flexBasis = 100 - offset + "%"
}

const App: Component = () => {
	const [term, setTerm] = createSignal("")
	const [selected, setSelected] = createSignal<Product | undefined>()
	const filteredProducts = createMemo(() => {
		const query = term().toLowerCase()
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
	})

	const dialog = (
		<dialog class="search">
			<form role="search" action="javascript:void(0)" aria-label="Søk blant produkter">
				<input
					placeholder="Søk"
					enterkeyhint="search"
					onInput={e => {
						setTerm(e.target.value)
					}}
				/>
			</form>
			<Show when={filteredProducts()?.length === 0}>
				<p>Fant ingen produkter.</p>
			</Show>
      <Show when={filteredProducts()?.[0]}>
        <ul class="product-list">
          <For each={filteredProducts()}>{
            (prod) => <li>
              <button class="product" aria-label="Gå til produkt" onClick={() => {
								setSelected(prod)
								dialog.close()
							}}>
                <img src={`/products/${prod.image}.webp`} />
                <div>{prod.name}</div>
              </button>
            </li>  
          }</For>
        </ul>
      </Show>
      <button class="back-btn" onClick={() => {
        dialog.close()
      }}>Tilbake</button>
		</dialog>
	) as HTMLDialogElement

	return (
		<>
			<nav>
				<button
					class="search-bar"
					onClick={() => {
						dialog.show()
					}}
				>
					Søk
				</button>
				{dialog}
			</nav>
			<main class={selected() && "has-product"}>
				<div class="col map-wrapper">
					<svg viewBox="0 0 300 300">
						<rect width="240" height="240" x="30" y="30" stroke="#888" fill="none" />
					</svg>
				</div>
				<div id="dragger" onPointerDown={() => {
					allowDragging = true
				}} />
				<Show when={selected()}>
					<section class="col product-view">
						<div class="product-wrapper">
							<div class="img-wrapper">
								<img src={`/products/${selected()!.image}.webp`} />
							</div>
							<h2>{selected()!.name}</h2>
							<p>{selected()!.description}</p>
							<p>{selected()!.price}</p>
						</div>
					</section>
				</Show>
				{/* <dialog class="product"></dialog> */}
			</main>
		</>
	)
}

onpointerup = () => {
	allowDragging = false
}

addEventListener("touchend", () => {
	allowDragging = false
})

addEventListener("touchmove", e => {
	if (allowDragging) updateWidth(e.changedTouches[0][media.matches ? "pageY" : "pageX"])
})

onmousemove = e => {
	if (allowDragging) updateWidth(e[media.matches ? "pageY" : "pageX"])
}

export default App
