<script lang="ts">
	import GlobalVar from '$lib';

	export let direction: 'UP' | 'DOWN' = 'UP';
	export let classes: string = '';
	export let css: string = '';

	$: style = `transform: rotate(${direction === 'UP' ? 0 : 180}deg); ${css}`;
</script>

<img
	src="objects/pipe-green.png"
	alt="pipe"
	class="w-[4%] h-[{GlobalVar.HAUTEUR_PIPE}] {classes}"
	{style}
/>
