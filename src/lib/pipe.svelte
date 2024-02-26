<script lang="ts">
	export let direction: 'to-up' | 'to-down' = 'to-up';

	$: style = `transform: rotate(${direction === 'to-up' ? 0 : 180}deg)`;
</script>

<img src="objects/pipe-green.png" alt="pipe" class="w-[4%]" {style} />
