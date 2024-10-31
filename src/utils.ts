const formatPrice = (price: number) => {
	return (price + "").replace(/\d(?=(?:\d\d\d)+$)/g, "$& ") + ",00"
}

export { formatPrice }
