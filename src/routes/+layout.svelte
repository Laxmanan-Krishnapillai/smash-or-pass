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
	let menuopen = false;
	export { cirql };
</script>

<header
	class="fixed left-0 right-0 mx-auto rounded-lg my-4 z-50 top-4 flex w-4/5 justify-between p-4 md:p-0 shadow-2xl items-center bg-white"
>
	<button
		on:click={(e) => {
			menuopen = !menuopen;
			let el = e.target.closest('button').nextElementSibling;
			!menuopen ? (el.style.display = 'flex') : null;
			menuopen
				? (el.animate(
						[
							{
								opacity: 1,
								transform: 'translateY(0)'
							},
							{
								opacity: 0,
								transform: 'translateY(100%)'
							}
						],
						{
							duration: 200,
							easing: 'ease-in-out',
							fill: 'forwards'
						}
				  ).onfinish = () => {
						el.style.display = 'none';
				  })
				: el.animate(
						[
							{
								opacity: 0,
								transform: 'translateY(100%)'
							},
							{
								opacity: 1,
								transform: 'translateY(0)'
							}
						],
						{
							duration: 200,
							easing: 'ease-in-out',
							fill: 'forwards'
						}
				  );
		}}
		class="btn variant-filled-primary btn-icon md:hidden"
		><span
			><svg
				xmlns="http://www.w3.org/2000/svg"
				class="icon icon-tabler icon-tabler-menu"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4 8l16 0" />
				<path d="M4 16l16 0" />
			</svg></span
		></button
	>
	<span
		class="bg-white top-full mt-4 md:mt-0 left-0 rounded-lg p-4 absolute md:static flex flex-col md:flex-row gap-4"
	>
		<a href="/rate/smash-pass" class="btn variant-filled-primary hover:variant-filled-secondary"
			>Smash or Pass</a
		>
		<a href="/rate/whoshotter" class="btn variant-filled-primary hover:variant-filled-secondary"
			>Who's hotter?</a
		>
		<a href="/rate/nameguesser" class="btn variant-filled-primary hover:variant-filled-secondary"
			>Name Guesser</a
		>
	</span>
	<a href="/login" class="btn variant-filled-primary hover:variant-filled-secondary">Login</a>
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
