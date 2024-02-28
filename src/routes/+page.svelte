<script lang="ts">
	import type PipeData from '$lib/PipeData';
	import Pipe from '$lib/Pipe.svelte';
	import { onDestroy, onMount } from 'svelte';
	import GlobalVar, { randomInRange } from '$lib';

	const BG_TRANSLATION_SPEED = 2000;
	const BASE_TRANSLATION_SPEED = 800;
	const BIRD_SPEED = 200;

	let pipes: PipeData[] = [];

	let birdY = 50;
	let currentBirdImg = '/objects/yellowbird-midflap.png';
	let lastFlapTimestamp: Date;
	let birdPivot = 0;
	let birdDirection: 'UP' | 'DOWN';

	let isRunning = true;
	let bgTranslation = 0;
	let baseTranslation = 0;
	let lastTimestamp: number | undefined;

	onMount(() => {
		window.onkeydown = handleKeyDown;
		window.onmousedown = handleMouseDown;

		addPipes();
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			flap();
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.button === 0) {
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
				birdDirection = 'DOWN';

				if (difference > BIRD_SPEED + BIRD_SPEED / 2) birdY += 0.5;
				else birdY += 0.4;

				currentBirdImg = '/objects/yellowbird-downflap.png';
			} else if (difference < BIRD_SPEED) {
				// L'oiseau monte
				birdDirection = 'UP';

				currentBirdImg = '/objects/yellowbird-upflap.png';

				if (difference < BIRD_SPEED / 3)
					birdY -= 0.8; // Vélocité
				else if (difference < BIRD_SPEED / 2) birdY -= 0.65;
				else birdY -= 0.5;
			}

			// Update bird direction
			if (birdDirection === 'UP') {
				if (birdPivot >= -12) birdPivot -= 4;
			}
			if (birdDirection === 'DOWN') {
				if (birdPivot <= 16) birdPivot += 4;
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

	function getBaseY() {
		// On fait commencer la hauteur du pipe de dessus selon la taille de la fenêtre
		let window_height = window.innerHeight;

		if (window_height < 500) return window_height / 0.6;
		if (window_height < 700) return window_height / 0.9;
		if (window_height < 1000) return window_height / 1.35;

		return window_height / 3;
	}

	/**
	 * Ajoute les pipes
	 */
	function addPipes() {
		const HAUTEUR_ESPACE_PX = 180;

		let xPos = 60; // Position de départ en pourcentage

		const maxY = window.innerHeight - window.innerHeight * 0.3 - HAUTEUR_ESPACE_PX - 30; // Où 30% = taille de la base

		for (let i = 0; i < 50; i++) {
			// Position du pipe du haut
			const randomY = randomInRange(0, maxY);

			// Taille de l'espace
			let diff = randomInRange(-65, 0);

			pipes = [
				...pipes,
				{
					xPos: xPos,
					// Calcul de la position du pipe du haut
					yPos: `-${getBaseY()}px + ${randomY}px`,
					direction: 'DOWN'
				},
				{
					xPos: xPos,
					// Calcul de la position du pipe du bas
					yPos: `-${getBaseY()}px + ${GlobalVar.HAUTEUR_PIPE} + ${HAUTEUR_ESPACE_PX + diff}px + ${randomY}px`,
					direction: 'UP'
				}
			];

			xPos += 35; // Prochaine pipe dans 35%
		}
	}
</script>

<div id="bg" class="w-screen h-screen" style="background-position-x: -{bgTranslation}%;" />

<div
	id="base"
	class="w-screen h-[20%] z-20"
	style="background-position-x: -{baseTranslation * 1.3}%;"
/>

{#if isRunning}
	<img
		src={currentBirdImg}
		alt="Bird"
		class="absolute left-[20%] w-[50px] object-contain transform"
		style="top: {birdY}%; transform: rotate({birdPivot}deg);"
	/>

	{#each pipes as pipe}
		<Pipe
			direction={pipe.direction}
			classes="absolute z-10"
			css={`left: calc(${pipe.xPos}% - ${baseTranslation}%); top: calc(${pipe.yPos})`}
		/>
	{/each}
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
