<script lang="ts">
	import type PipeData from '$lib/pipeData';
	import Pipe from '$lib/pipe.svelte';
	import { onDestroy, onMount } from 'svelte';
	import GlobalVar, { collide, randomInRange } from '$lib';
	import { slide } from 'svelte/transition';

	const BG_TRANSLATION_SPEED = 500;
	const BASE_TRANSLATION_SPEED = 100;
	const BIRD_VELOCITY = 200;
	let chuteVitesseMultiplicateur = 1;

	const GAME_HEIGHT = 600;
	const GAME_WIDTH = 300;

	let _gameOver = false;
	let gameOverVisibility = false; // Délai entre le momemnt où l'oiseau meurt et le moment où le game over s'affiche
	let bestScore: number = 0;

	let pipes: PipeData[] = [];
	let nextPipeId = 1;
	let score = 0;
	let pipesScored: number[] = []; // Liste des pipes déjà passés
	$: scoreList = score.toString().split('');

	let bird: HTMLElement;
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
			if (_gameOver) return;
			if (!isRunning) startGame();

			flap();
		}
	}

	function handleMouseDown(event: MouseEvent) {
		// Vérifie que le target n'est pas un <a> ou un <img> ou boutton
		if (
			(event.target as HTMLElement).tagName === 'A' ||
			(event.target as HTMLElement).tagName === 'BUTTON'
		)
			return;

		if (event.button === 0) {
			if (_gameOver) return;
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
		if (_gameOver) {
			// L'oiseau est mort (n'est pas appelé avant que le jeu ne commence)
			currentBirdImg = '/objects/yellowbird-dead.png';
			return;
		}

		if (!isRunning) return;

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

				if (difference > BIRD_VELOCITY + BIRD_VELOCITY / 2)
					birdY += 0.5 * chuteVitesseMultiplicateur;
				else birdY += 0.4 * chuteVitesseMultiplicateur;

				chuteVitesseMultiplicateur += 0.07;

				currentBirdImg = '/objects/yellowbird-downflap.png';
			} else if (difference < BIRD_VELOCITY) {
				chuteVitesseMultiplicateur = 1;

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

			// Update pipes position
			pipes = pipes.map((pipe) => {
				pipe.xPos -= 2;

				return pipe;
			});

			// Update score & and check for collision
			pipes.forEach((pipe) => {
				// Si le pipe est passé (ne prend en compte que les pipes du haut pour éviter les doublons)
				if (pipe.direction === 'DOWN' && pipe.xPos < 0 && !pipesScored.includes(pipe.id)) {
					score++;
					pipesScored.push(pipe.id);
				}

				// Delete pipes that are out of the screen
				if (pipe.xPos < -60) {
					pipes = pipes.filter((p) => p.id !== pipe.id);
				}

				// Check for collision
				const pipeElement = document.getElementById(`pipe-${pipe.id}`);
				if (pipeElement && collide(bird, pipeElement)) {
					gameOver();
				}

				// Vérifie si l'oiseau est sorti de l'écran ou a touché le sol
				if (birdY < 0 || birdY > 74) {
					gameOver();
				}
			});

			if (pipes.length < 4) {
				addPipes();
			}
		}

		// Met à jour lastTimestamp avec l'horodatage actuel
		lastTimestamp = timestamp;

		// Appelle la fonction mainLoop à nouveau pour la prochaine frame
		requestAnimationFrame(mainLoop);
	}

	/**
	 * Fonction appelée lorsque le jeu est terminé
	 */
	function gameOver() {
		bestScore = Number(localStorage.getItem('bestScore')) || 0;
		if (score > bestScore) {
			bestScore = score;
			localStorage.setItem('bestScore', bestScore.toString());
		}

		isRunning = false;
		_gameOver = true;

		setTimeout(() => {
			gameOverVisibility = true;
		}, 2000);
	}

	/**
	 * Fait monter l'oiseau
	 */
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

		// Si on a déjà des pipes, on l'ajoute en dehors de l'écran
		let xPos = pipes.length === 0 ? 280 : 420; // Position de la première pipe

		const maxY = 600 - window.innerHeight * 0.3 - 140; // Où 30% = taille de la base

		for (let i = 0; i < 5; i++) {
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
					direction: 'DOWN',
					id: nextPipeId + 1
				},
				{
					xPos: xPos,
					// Calcul de la position du pipe du bas
					yPos: `-750px + ${GlobalVar.HAUTEUR_PIPE} + ${HAUTEUR_ESPACE_PX + diff}px + ${randomY}px`,
					direction: 'UP',
					id: nextPipeId + 2
				}
			];

			nextPipeId += 2;

			xPos += randomInRange(180, 275); // Prochaine pipe espace
		}
	}

	function playAgainButtonClicked(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		pipes = [];
		addPipes();
		isRunning = false;
		_gameOver = false;
		birdY = 50;
		score = 0;
		currentBirdImg = '/objects/yellowbird-midflap.png';
		birdPivot = 0;
		gameOverVisibility = false;
		pipesScored = [];
	}
</script>

<div class="w-screen h-screen flex items-center justify-center">
	<div class="w-full h-full" id="bg-behind"></div>

	<div
		class="absolute overflow-hidden outline outline-[#1a361f]"
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
				bind:this={bird}
				class={'absolute left-[20%] w-[50px] object-contain transform ' +
					(GlobalVar.DEBUG ? 'bg-green-800' : '')}
				style="top: {birdY}%; transform: rotate({birdPivot}deg);"
			/>

			{#each pipes as pipe (pipe.id)}
				<Pipe
					id={pipe.id}
					direction={pipe.direction}
					classes="absolute z-10"
					css={`left: calc(${pipe.xPos}px); top: calc(${pipe.yPos})`}
				/>
			{/each}

			{#if !isRunning && !_gameOver}
				<img
					src="/UI/message2.png"
					alt="Get ready"
					class="absolute inset-0 w-full h-full z-30 object-contain px-10 pb-20"
				/>
			{:else if isRunning || _gameOver}
				<!-- Affichage du score -->
				<div class="absolute top-4 flex flex-row w-full justify-center gap-x-0.5 z-50">
					{#each scoreList as digit}
						<img src={`/UI/Numbers/${digit}.png`} alt={digit} class="w-6 h-6" />
					{/each}
				</div>
			{/if}
			{#if gameOverVisibility}
				<div
					transition:slide
					class="z-50 absolute inset-0 flex items-center justify-center w-full h-full"
				>
					<div
						class="w-10/12 h-3/5 bg-[#cec590] border-4 border-[#a09975] rounded-2xl bg-opacity-95 flex items-center justify-center py-5 px-3 flex-col monospace"
					>
						<img src="/UI/gameover.png" alt="Game over" class="h-16 object-contain" />

						<div
							class="bg-[#22684b57] border-4 border-[#1b323681] rounded-full mt-auto text-center px-8 py-1"
						>
							<p class="text-lg font-bold">Best score :</p>
							<p class="text-3xl font-bold">{bestScore}</p>
						</div>
						<div
							class="bg-[#1855a557] border-4 border-[#1855a557] rounded-full mt-auto text-center px-8 py-1"
						>
							<p class="text-base font-bold">Score :</p>
							<p class="text-xl font-bold">{score}</p>
						</div>

						<button
							class="mt-auto w-3/4 h-12 bg-[#848a4e] border-2 border-[#5a5641] text-xl rounded-lg text-[#16180b] font-bold"
							on:click={playAgainButtonClicked}
						>
							Play again
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<a href="https://github.com/zonetecde/bird-flapping" target="_blank">
	<img src="github.png" alt="GitHub" class="absolute top-2 right-2 w-16 h-16 hidden lg:block" />
</a>

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
