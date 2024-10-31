export type Product = {
	name: string
	description: string
	price: number
	availability: string | null
	image: string
}

export const products: Product[] = [
	{
		name: "DeWalt DCS355N multiverktøy u/batteri",
		description:
			"18V multiverktøy med børsteløs motor for sliping og kutting. Leveres uten lader og batteri.",
		price: 1595,
		availability: "6-20",
		image: "dewalt",
	},
	{
		name: "Makita DTW700Z LXT® 18V muttertrekker",
		description:
			'Kompakt og kraftig 18V muttertrekker med børsteløs motor og 1/2"" innfesting. Egner seg til kraftkrevende montasje av bolter i dimensjon M10-M24.',
		price: 3495,
		availability: "6-20",
		image: "makita",
	},
	{
		name: "Roybi ONE+ R16GN18-0 dykkertpistol u/batteri",
		description:
			"Dykkertpistol 18V ONE+.16G Dykkertpistol med kraftig AirStrike Teknologi som eliminerer behovet for støyende kompressorer, lange slanger eller dyre gasspatroner. Avfyrer dykkert mellom 19-65 mm i lengde og 1,6 mm i bredde. Opptil 60 dykkert pr. minutt og 1000 pr. 5,0Ah opplading.",
		price: 3195,
		availability: null,
		image: "roybi",
	},
]
