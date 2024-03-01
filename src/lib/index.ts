let GlobalVar = {
	HAUTEUR_PIPE: '800px',
	DEBUG: false
};

export default GlobalVar;

export const randomInRange = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

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
