<script lang="ts">
	import GlobalVar from '$lib';

	export let direction: 'UP' | 'DOWN' = 'UP';
	export let classes: string = '';
	export let css: string = '';
	export let id: number = 0;

	$: style = `transform: rotate(${direction === 'UP' ? 0 : 180}deg); ${css}`;
</script>

<img
	id={`pipe-${id}`}
	src="objects/pipe.png"
	alt="pipe"
	class="w-[60px] {classes} {GlobalVar.DEBUG ? 'bg-red-800' : ''}"
	style="height: {GlobalVar.HAUTEUR_PIPE}; {style}"
/>
