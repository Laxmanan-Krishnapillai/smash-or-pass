<script lang="ts">
	import type { Writable } from 'svelte/store';
	export let isChecked: Writable<boolean>;
</script>

<div class="switchbox">
	<input class="hidden" type="checkbox" bind:checked={$isChecked} id="switch" name="switch" />
	<label
		class="relative cursor-pointer focus:border-2 border-primary-500 bg-white w-60 py-4 justify-around flex rounded-lg"
		for="switch"
		data-on="ON"
		data-off="OFF"
	>
		<span
			class="relative transition-colors {!$isChecked
				? 'text-primary-500'
				: 'text-white'} font-medium z-10">Kvinde</span
		>
		<span
			class="relative transition-colors {$isChecked
				? 'text-primary-500'
				: 'text-white'} font-medium z-10">Mand</span
		>
		<div
			class="absolute bg-secondary-500 rounded-lg p-1 w-[7.25rem] left-1 right-1 top-1 bottom-1 transition-transform {!$isChecked
				? 'translate-x-full'
				: ''}"
		/></label
	>
</div>
