<script lang="ts">
	import Pipe from '$lib/pipe.svelte';
	import { onDestroy, onMount } from 'svelte';

	const BG_TRANSLATION_SPEED = 2000;
	const BASE_TRANSLATION_SPEED = 1000;

	let birdY = 50;
	const BIRD_SPEED = 600;
	let currentBirdImg = '/objects/yellowbird-midflap.png';
	let lastFlapTimestamp: Date;
	let birdPivot = 0;

	let isRunning = true;
	let bgTranslation = 0;
	let baseTranslation = 0;
	let lastTimestamp: number | undefined;

	onMount(() => {
		window.onkeydown = handleKeyDown;
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			flap();
		}
	}

	function startGame() {
		isRunning = true;
		lastTimestamp = undefined;
	}

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

		if (lastFlapTimestamp) {
			// Calcule la différence de temps entre les horodatages
			let difference = new Date().getTime() - lastFlapTimestamp.getTime();

			// Si la différence dépasse le temps que l'oiseau prend pour monter alors l'oiseau redescent
			// Le + 5 sert à laisser l'oiseau sur place un petit peu
			if (difference > BIRD_SPEED + 5) {
				// L'oiseau descend
				birdPivot = 12;

				if (difference > BIRD_SPEED + BIRD_SPEED / 2) birdY += 0.5;
				else birdY += 0.4;

				currentBirdImg = '/objects/yellowbird-downflap.png';
			} else if (difference < BIRD_SPEED) {
				// L'oiseau monte

				birdPivot = -12;

				currentBirdImg = '/objects/yellowbird-upflap.png';

				if (difference < BIRD_SPEED / 3)
					birdY -= 0.8; // Vélocité
				else if (difference < BIRD_SPEED / 2) birdY -= 0.65;
				else birdY -= 0.5;
			}
		}

		// Met à jour lastTimestamp avec l'horodatage actuel
		lastTimestamp = timestamp;

		// Appelle la fonction mainLoop à nouveau pour la prochaine frame
		requestAnimationFrame(mainLoop);
	}

	function flap() {
		if (!isRunning) {
			return;
		}

		// Si c'est le premier flap
		if (!lastTimestamp) requestAnimationFrame(mainLoop);

		// Flap
		lastFlapTimestamp = new Date();
	}
</script>

<div id="bg" class="w-screen h-screen" style="background-position-x: -{bgTranslation}%;" />

<div id="base" class="w-screen h-[20%]" style="background-position-x: -{baseTranslation}%;" />

<div class="w-screen h-screen absolute left-0 top-0">
	<Pipe direction="to-up" />
</div>

{#if isRunning}
	<img
		src={currentBirdImg}
		alt="Bird"
		class="absolute left-[20%] w-[5%] object-contain transform"
		style="top: {birdY}%; transform: rotate({birdPivot}deg);"
	/>
{/if}

{#if !isRunning}
	<div
		class="absolute top-[20%] left-1/2 -translate-x-1/2 text-[#333052] bg-[#95cce2] py-12 rounded-3xl shadow-2xl shadow-blue-900 border-4 border-blue-950 w-4/6 xl:w-3/6 min-w-[400px] flex items-center flex-col"
	>
		<p class="text-center text-[600%] lg:text-[800%]">Bird Flapping</p>

		<button on:click={startGame} class="text-[#332b57] font-bold text-[600%]">Start</button>
	</div>
{/if}

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
