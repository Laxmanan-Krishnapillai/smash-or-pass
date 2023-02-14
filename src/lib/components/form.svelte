<script lang="ts">
	import { enhance } from '$app/forms';
	let form: HTMLFormElement;
	import { goto } from '$app/navigation';
	let username = '';
	let password = '';
</script>

<section class="unstyled flex justify-center items-center h-screen">
	<form
		bind:this={form}
		use:enhance={({ form, data, action, cancel }) => {
			return async ({ result, update }) => {
				console.log(result);
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
