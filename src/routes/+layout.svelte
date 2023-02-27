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
	import { dbready } from '$lib/db';
	import { page } from '$app/stores';
	let visible = false;
	onMount(async () => {
		if (!localStorage.getItem('cookie')) {
			visible = true;
		}
		if ($page.url.pathname === '/login') return;
		const token = document.cookie.split('token=')[1].split(';')[0];
		if (!token) goto('/login');
		console.log(token);
		if (!cirql.isConnected) {
			await cirql.ready();
			console.log('ready');
			if (!cirql.options.credentials) {
				await cirql.signIn({ token });
				dbready.set(true);
			}
			dbready.set(true);
		}
		if (cirql.options.credentials) {
			dbready.set(true);
		} else {
			await cirql.signIn({ token });
			dbready.set(true);
		}
	});
	export { cirql };
</script>

<header
	class="fixed left-0 right-0 mx-auto rounded-lg my-4 z-50 top-4 flex w-4/5 justify-between p-4 shadow-2xl items-center bg-white"
>
	<span class="flex gap-4">
		<a
			href="/rate/smash-pass"
			class="btn variant-filled-primary hover:variant-filled-secondary sm:btn-sm ">Smash or Pass</a
		>
		<a
			href="/rate/whoshotter"
			class="btn variant-filled-primary hover:variant-filled-secondary sm:btn-sm">Who's hotter?</a
		>
		<a
			href="/rate/nameguesser"
			class="btn variant-filled-primary hover:variant-filled-secondary sm:btn-sm">Name Guesser</a
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
