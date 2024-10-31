import { createMemo, createSignal, For, Show, Signal, type Component } from "solid-js"
import { Product, products } from "./products"
import { formatPrice } from "./utils"

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
	const [cart, setCart] = createSignal<[Product, Signal<string>][]>([])
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

	const cartDialog = (
		<dialog class="cart">
				<Show when={cart()[0]} fallback={<span>Handlelisten er tom.</span>}>
					<ul class="cart-list">
						<For each={cart()}>{
							([prod, [count, setCount]]) => (
								<li>
									<img src={`/products/${prod.image}.webp`} />
									<div>
										<div>{prod.name}</div>
										<label aria-label="Antall">
											<button onClick={() => {
												setCount(`${+count() - 1}`)
											}}>-</button>
											<input type="number" value={count()} onInput={e => {
												setCount(e.target.value)
											}} />
											<button onClick={() => {
												setCount(`${+count() + 1}`)
											}}>+</button>
										</label>
									</div>
									<div>{formatPrice(prod.price * +count())}</div>
								</li>
							)
						}</For>
					</ul>
				</Show>
			<button class="back-btn" onClick={() => {
				cartDialog.close()
			}}>Tilbake</button>
		</dialog>
	) as HTMLDialogElement

	return (
		<>
			<nav>
				<div class="logo" aria-label="Localizer"></div>
				<button
					class="search-bar"
					onClick={() => {
						dialog.show()
					}}
				>
					Søk
				</button>
				<button
					class="cart-btn"
					aria-label="Vis handlekurv"
					data-count={cart().length || null}
					onClick={() => {
					cartDialog.show()
				}} />
				{dialog}
				{cartDialog}
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
							<img src={`/products/${selected()!.image}.webp`} />
							<h2>{selected()!.name}</h2>
							<p>{selected()!.description}</p>
							<p>{formatPrice(selected()!.price)}</p>
							<div>
								<button onClick={() => {
									const item = cart().find(item => item[0] == selected())
									if (item) {
										item[1][1](count => `${+count + 1}`)
									}
									else {
										const newCart = cart().slice()
										newCart.push([selected()!, createSignal("1")])
										setCart(newCart)
									}
								}}>Legg til handlekurv</button>
								<button>Fant ikke produktet</button>
							</div>
						</div>
					</section>
				</Show>
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
