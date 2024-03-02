/**
 * Array containing the playing audio files
 * @type {Array<HTMLAudioElement>}
 */
let playingAudios: HTMLAudioElement[] = [];

/**
 * @param {string} soundFile
 * @description - Plays an audio file
 */
export const PlayAudio = (soundFile: string): void => {
	const audio = new Audio(soundFile);
	audio.volume = 0.04;
	playingAudios.push(audio);
	audio.play();
	audio.onended = () => {
		playingAudios = playingAudios.filter((el) => el !== audio);
	};
};

/**
 * @param {string} soundFile
 * @description - Stops playing the audio file
 */
export const StopAudio = (soundFile: string): void => {
	const audio = playingAudios.find((el) => el.src.includes(soundFile));
	if (audio) {
		audio.pause();
		playingAudios = playingAudios.filter((el) => el !== audio);
	}
};
