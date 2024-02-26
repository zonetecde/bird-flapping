<script lang="ts">
	import Pipe from '$lib/pipe.svelte';
	import { onDestroy, onMount } from 'svelte';

	const BG_TRANSLATION_SPEED = 2000;
	const BASE_TRANSLATION_SPEED = 1000;

	let isRunning = false;
	let bgTranslation = 0;
	let baseTranslation = 0;
	let lastTimestamp: number;

	onMount(() => {
		requestAnimationFrame(mainLoop);
	});

	/**
	 * Boucle principale de mise à jour.
	 * @param {number} timestamp - Horodatage actuel.
	 */
	function mainLoop(timestamp: number) {
		if (lastTimestamp) {
			// Calcule la différence de temps entre les horodatages
			const delta = timestamp - lastTimestamp;
			// Calcule la translation du fond d'écran en fonction du temps écoulé
			bgTranslation += (4 * delta) / BG_TRANSLATION_SPEED;
			baseTranslation += (4 * delta) / BASE_TRANSLATION_SPEED;
			// Si la translation dépasse la largeur de l'image de fond, la réinitialise
			if (bgTranslation >= 500) {
				// Où 500 est le nombre dans background-size: 500px 100%;
				bgTranslation -= 500;
			}
		}
		// Met à jour lastTimestamp avec l'horodatage actuel
		lastTimestamp = timestamp;

		// Appelle la fonction mainLoop à nouveau pour la prochaine frame
		requestAnimationFrame(mainLoop);
	}
</script>

<div id="bg" class="w-screen h-screen" style="background-position-x: {bgTranslation}%;" />

<div id="base" class="w-screen h-[20%]" style="background-position-x: {baseTranslation}%;" />

<div class="w-screen h-screen absolute left-0 top-0">
	<Pipe direction="to-up" />
</div>

<style>
	#bg {
		background-image: url('/objects/background-day.png');
		background-size: 500px 100%;
		background-repeat: repeat-x;
	}

	#base {
		position: absolute;
		bottom: 0;
		background-image: url('/objects/base.png');
		background-size: 400px 100%;
		background-repeat: repeat-x;
	}
</style>
