let GlobalVar = {
	HAUTEUR_PIPE: '800px',
	DEBUG: false
};

export default GlobalVar;

/**
 * Fonction qui retourne un nombre aléatoire entre min et max
 * @param min Le nombre minimum
 * @param max  Le nombre maximum
 * @returns  Un nombre aléatoire entre min et max
 */
export const randomInRange = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 *  Fonction qui retourne si deux éléments se touchent
 * @param el1 L'élément 1
 * @param el2  L'élément 2
 * @param margeErreur  La marge d'erreur
 * @returns  Si les deux éléments se touchent
 */
export const collide = (el1: HTMLElement, el2: HTMLElement, margeErreur: number = 15) => {
	const rect1 = el1.getBoundingClientRect();
	const rect2 = el2.getBoundingClientRect();

	return (
		rect1.top <= rect2.bottom - margeErreur &&
		rect1.right >= rect2.left + margeErreur &&
		rect1.bottom >= rect2.top + margeErreur &&
		rect1.left <= rect2.right - margeErreur
	);
};
