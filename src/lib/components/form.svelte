<script lang="ts">
	import { enhance } from '$app/forms';
	let form: HTMLFormElement;
	import { goto } from '$app/navigation';
	import { authStudent } from '$lib/db';
	import { cirql } from '$lib/db';
	import { dbready } from '$lib/db';
	import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	let username = '';
	let password = '';
	const settings = {
		message: 'Logging in...'
	} satisfies ToastSettings;
</script>

<section class="unstyled flex justify-center items-center h-screen">
	<form
		bind:this={form}
		on:submit={() => {
			toastStore.trigger(settings);
			toastStore.clear();
		}}
		use:enhance={({ form, data, action, cancel }) => {
			return async ({ result, update }) => {
				console.log(result);
				console.log(result.data);
				if (result.type === 'success') authStudent.set(result.data.student);
				const token = document.cookie.split('token=')[1].split(';')[0];
				if (!cirql.isConnected) {
					await cirql.ready();
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
				goto('/');
			};
		}}
		class="unstyled flex flex-col w-96 gap-2"
		method="POST"
	>
		<label for="username">Brugernavn</label>
		<input
			class="unstyled text-black py-4 px-10 w-full rounded-lg"
			type="text"
			required={true}
			name="username"
			id="username"
			bind:value={username}
		/>
		<label class="mt-1" for="password">Adgangskode</label>
		<input
			class="unstyled text-black py-4 px-10 w-full rounded-lg"
			type="password"
			required={true}
			name="password"
			id="password"
			bind:value={password}
		/>
		<button
			type="submit"
			class="mt-3 rounded-lg btn variant-filled-secondary font-semibold btn-base">Login</button
		>
	</form>
</section>
