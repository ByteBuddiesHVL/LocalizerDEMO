import { createMemo, createSignal, For, Show, Signal, type Component } from "solid-js"
import { Product, products } from "./products"
import { formatPrice, getRoute } from "./utils"

const letter = /\p{L}/u

const App: Component = () => {
	const [term, setTerm] = createSignal("")
	const [selected, setSelected] = createSignal<Product | undefined>()
	const [cart, setCart] = createSignal<[Product, Signal<string>][]>([])
	const inCart = createMemo(() => cart().some(p => p[0] == selected()))
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
				<div class="logo" aria-label="Localizer">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path id="logo" fill="#e86b2b" d="M21.38 5.71c.1-.1.27-.08.35.04 1.14 1.79 1.81 3.93 1.81 6.22 0 6.39-5.18 11.57-11.57 11.57C5.65 23.54.51 18.47.41 12.17.3 5.71 5.55.39 12 .41c2.74 0 5.25.96 7.23 2.56.11.09.12.24.02.34L17.72 4.84c-.08.08-.21.09-.3.02-1.93-1.49-4.5-2.2-7.23-1.68C6.75 3.84 4 6.48 3.24 9.9 1.92 15.79 6.41 21 12.09 20.93c4.94-.06 8.92-4.16 8.84-9.1-.03-1.55-.45-3.01-1.17-4.28-.05-.09-.03-.2.04-.27l1.57-1.57ZM17.6 9.48c.11-.11.31-.07.37.08.3.74.46 1.56.46 2.41 0 3.54-2.9 6.43-6.43 6.43-3.61 0-6.53-2.96-6.45-6.58.07-3.44 2.87-6.23 6.31-6.3 1.37-.02 2.65.38 3.71 1.09.12.08.14.25.04.35L14.05 8.52c-.07.07-.18.09-.27.04-.54-.28-1.15-.44-1.8-.44-2.4 0-4.29 2.19-3.77 4.68.31 1.47 1.47 2.63 2.94 2.94 2.49.52 4.68-1.37 4.68-3.77 0-.19-.01-.37-.04-.55-.01-.07.01-.14.06-.19L17.58 9.5Z"/>
					</svg>
				</div>
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
				<div class="map-wrapper">
					<svg viewBox="0 0 300 300">
						{
							[10, 40, 70, 100, 130, 160, 190, 220].map(y => [
								<rect y={y} x="10" height="15" width="120" rx="2" fill="hsl(21, 20%, 90%)" />,
								<rect y={y} x="170" height="15" width="120" rx="2" fill="hsl(21, 20%, 90%)" />,
							])
						}
						<circle fill="#e86b2b" cx="30" cy="250" r="4" />
						<circle fill="none" cx="30" cy="250" r="5.5" stroke="#e86b2b" />
						<circle fill="none" cx="30" cy="250" r="7.5" stroke="#e86b2b" />
						<Show when={selected() && !inCart()}>
							<use href="#logo" x={selected()!.x * 2.5} y={selected()!.y * 2.5} transform="scale(0.4)" />
						</Show>
						<For each={cart()}>{
							([prod]) => <>
								<use href="#logo" x={prod.x * 2.5} y={prod.y * 2.5} transform="scale(0.4)" />
							</>
						}</For>
						<path stroke-dasharray="3 4" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" d={getRoute(cart())} />
					</svg>
				</div>
				<Show when={selected()}>
					<section class="product-view">
						<div class="product-wrapper">
							<img src={`/products/${selected()!.image}.webp`} />
							<h2>{selected()!.name}</h2>
							<p>{selected()!.description}</p>
							<div class="avail">
								<span class={selected()!.availability ? "available" : "unavail"}>
									{selected()!.availability || "Ikke"} på lager
								</span>
								<span class="price">{formatPrice(selected()!.price)}</span>
							</div>
							<div>
								<button onClick={() => {
									const newCart = cart().slice()
									if (inCart()) {
										newCart.splice(newCart.findIndex(p => p[0] == selected()), 1)
									} else {
										newCart.push([selected()!, createSignal("1")])
									}
									setCart(newCart)
								}}>{inCart() ? "Fjern fra handleliste" : "Legg i handleliste"}</button>
								<div class="spacer"></div>
								<button>Jeg fant ikke varen</button>
							</div>
						</div>
					</section>
				</Show>
			</main>
		</>
	)
}

export default App
