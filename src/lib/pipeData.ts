/**
 * Modélise une donnée de tuyau
 * @interface PipeData
 * @property {number} xPos - La position x du tuyau
 * @property {'UP' | 'DOWN'} direction - La direction du tuyau
 * @property {string} yPos - La position y du tuyau
 * @property {number} id - L'identifiant du tuyau
 */
export default interface PipeData {
	xPos: number;
	direction: 'UP' | 'DOWN';
	yPos: string;
	id: number;
}
