import { env } from "~/env.ts";

type Brand =
	| "7-Eleven"
	| "BP"
	| "Coles Express"
	| "Ampol"
	| "EG Ampol"
	| "United"
	| "Liberty"
	| "Apco"
	| "Shell"
	| "Puma"
	| "Costco"
	| "Metro Fuel"
	| "Metro Petroleum"
	| "Mobil"
	| "Caltex"
	| "Reddy Express";

export const BRAND_DOMAIN_MAP = {
	"7-Eleven": "7eleven.com",
	BP: "bp.com.au",
	"Coles Express": "coles.com.au",
	Ampol: "ampol.com.au",
	"EG Ampol": "ampol.com.au",
	United: "unitedpetroleum.com.au",
	Liberty: "libertyoil.com.au",
	Apco: "apco.com.au",
	Shell: "shell.com.au",
	Puma: "pumaenergy.com.au",
	Costco: "costco.com.au",
	"Metro Fuel": "metropetroleum.com.au",
	"Metro Petroleum": "metropetroleum.com.au",
	Mobil: "mobil.com.au",
	Caltex: "caltex.com.au",
	"Reddy Express": "reddyexpress.com.au",
};

function isBrand(brandName: string): brandName is Brand {
	return brandName in BRAND_DOMAIN_MAP;
}

export function getBrandLogoUrl(
	brandName: string,
	sizeValue: number = 64,
): string | undefined {
	if (!isBrand(brandName)) return undefined;
	const domain = BRAND_DOMAIN_MAP[brandName];

	const token = typeof import.meta !== "undefined" && import.meta.env
		? import.meta.env.VITE_LOGO_DEV_TOKEN
		: env.VITE_LOGO_DEV_TOKEN;
	return `https://img.logo.dev/${domain}?token=${token}&size=${sizeValue}`;
}
