<script lang="ts">
	// import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '../theme.postcss';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
	import { Toast } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { cirql } from '$lib/db';
	let visible = false;
	onMount(async () => {
		if (!localStorage.getItem('cookie')) {
			visible = true;
		}
		const token = document.cookie.split('token=')[1];
		if (!token) goto('/login');
	});
	export { cirql };
</script>

<header
	class="fixed left-0 right-0 mx-auto rounded-lg my-4 z-50 top-4 flex w-4/5 justify-between p-4 shadow-2xl items-center bg-white"
>
	<span class="flex gap-4">
		<a
			href="/smash-pass"
			class="btn variant-filled-primary hover:variant-filled-secondary btn-sm sm:btn-base"
			>Smash or Pass</a
		>
		<a
			href="/whoshotter"
			class="btn variant-filled-primary hover:variant-filled-secondary btn-sm sm:btn-base"
			>Who's hotter?</a
		>
		<a
			href="/nameguesser"
			class="btn variant-filled-primary hover:variant-filled-secondary btn-sm sm:btn-base"
			>Name Guesser</a
		>
	</span>
	<a
		href="/login"
		class="btn variant-filled-primary hover:variant-filled-secondary btn-sm sm:btn-base">Login</a
	>
</header>

<slot />
<Toast />
{#if visible}
	<aside
		transition:fly={{ y: 100 }}
		class="alert variant-ghost max-w-2xl left-0 right-0 mx-auto bottom-20 fixed"
	>
		<!-- Icon -->
		<div><img alt="Cookie icon" class="w-10 h-10" src="./cookie.svg" /></div>
		<!-- Message -->
		<div class="alert-message">
			<p>Denne side bruger cookies. Ved at bruge siden accepterer du vores brug af cookies</p>
		</div>
		<!-- Actions -->
		<div class="alert-actions">
			<button
				class="btn btn-base variant-filled-secondary"
				on:click={() => {
					localStorage.setItem('cookie', 'true');
					visible = false;
				}}>Indforstået</button
			>
		</div>
	</aside>
{/if}

<style>
	:global(.rmbtn button:nth-child(2)) {
		display: none !important;
	}
</style>
