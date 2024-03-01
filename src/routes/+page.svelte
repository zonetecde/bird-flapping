<script lang="ts">
	import type PipeData from '$lib/PipeData';
	import Pipe from '$lib/Pipe.svelte';
	import { onDestroy, onMount } from 'svelte';
	import GlobalVar, { randomInRange } from '$lib';

	const BG_TRANSLATION_SPEED = 500;
	const BASE_TRANSLATION_SPEED = 100;
	const BIRD_VELOCITY = 200;

	const GAME_HEIGHT = 600;
	const GAME_WIDTH = 300;

	let pipes: PipeData[] = [];

	let birdY = 50;
	let currentBirdImg = '/objects/yellowbird-midflap.png';
	let lastFlapTimestamp: Date;
	let birdPivot = 0;
	let birdDirection: 'UP' | 'DOWN';

	let isRunning = false;
	let bgTranslation = 0;
	let baseTranslation = 0;
	let lastTimestamp: number | undefined;

	let scale = 1; // La taille du jeu, par rapport à la taille de l'écran

	onMount(() => {
		window.onkeydown = handleKeyDown;
		window.onmousedown = handleMouseDown;

		addPipes();

		window.onresize = () => {
			scale = window.innerHeight / GAME_HEIGHT;
		};

		// simulate resize to set the scale
		// @ts-ignore
		window.onresize(null);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			if (!isRunning) startGame();

			flap();
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.button === 0) {
			if (!isRunning) startGame();

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
		}

		if (lastFlapTimestamp) {
			// Calcule la différence de temps entre les horodatages
			let difference = new Date().getTime() - lastFlapTimestamp.getTime();

			// Si la différence dépasse le temps que l'oiseau prend pour monter alors l'oiseau redescent
			// Le + 5 sert à laisser l'oiseau sur place un petit peu
			if (difference > BIRD_VELOCITY + 5) {
				// L'oiseau descend
				birdDirection = 'DOWN';

				if (difference > BIRD_VELOCITY + BIRD_VELOCITY / 2) birdY += 0.5;
				else birdY += 0.4;

				currentBirdImg = '/objects/yellowbird-downflap.png';
			} else if (difference < BIRD_VELOCITY) {
				// L'oiseau monte
				birdDirection = 'UP';

				currentBirdImg = '/objects/yellowbird-upflap.png';

				if (difference < BIRD_VELOCITY / 3)
					birdY -= 0.8; // Vélocité
				else if (difference < BIRD_VELOCITY / 2) birdY -= 0.65;
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

	/**
	 * Ajoute les pipes
	 */
	function addPipes() {
		const HAUTEUR_ESPACE_PX = 180;

		let xPos = 280; // Position de départ en px

		const maxY = 600 - window.innerHeight * 0.3 - 140; // Où 30% = taille de la base

		for (let i = 0; i < 50; i++) {
			// Position du pipe du haut
			const randomY = randomInRange(0, maxY);

			// Taille de l'espace
			let diff = randomInRange(-85, -20);

			pipes = [
				...pipes,
				{
					xPos: xPos,
					// Calcul de la position du pipe du haut
					yPos: `-750px  + ${randomY}px`,
					direction: 'DOWN'
				},
				{
					xPos: xPos,
					// Calcul de la position du pipe du bas
					yPos: `-750px + ${GlobalVar.HAUTEUR_PIPE} + ${HAUTEUR_ESPACE_PX + diff}px + ${randomY}px`,
					direction: 'UP'
				}
			];

			xPos += randomInRange(180, 275); // Prochaine pipe espace
		}
	}
</script>

<div class="w-screen h-screen flex items-center justify-center">
	<div class="w-full h-full" id="bg-behind"></div>

	<div
		class="absolute overflow-hidden outline outline-x-4 outline-[#1a361f]"
		style={`transform: scale(${scale}); height: ${GAME_HEIGHT}px; width: ${GAME_WIDTH}px;`}
	>
		<div class="relative w-full h-full">
			<div id="bg" class="w-full h-full" style="background-position-x: -{bgTranslation}%;" />

			<div
				id="base"
				class="w-full h-[20%] z-20"
				style="background-position-x: {baseTranslation * 3}%;"
			/>

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
					css={`left: calc(${pipe.xPos}px - ${baseTranslation}%); top: calc(${pipe.yPos})`}
				/>
			{/each}

			{#if !isRunning}
				<img
					src="/UI/message2.png"
					alt="Get ready"
					class="absolute inset-0 w-full h-full z-30 object-contain px-10 pb-20"
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	#bg-behind {
		background-image: url('/objects/background-day.png');
		background-size: 25% 100%;
		background-repeat: repeat-x;

		filter: blur(10px);
	}

	#bg {
		background-image: url('/objects/background-day.png');
		background-size: 350px 100%;
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
