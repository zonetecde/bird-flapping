let GlobalVar = {
	HAUTEUR_PIPE: '800px'
};

export default GlobalVar;

export const randomInRange = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};
