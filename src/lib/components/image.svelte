<script lang="ts">
	import { getImage } from '$lib/image';
	import { onDestroy } from 'svelte';
	import type { Student } from '$lib/schema';
	export let student: Student;
	export let name = true;
	export let scale = 1;
	const abort = new AbortController();
	onDestroy(() => {
		abort.abort();
	});
</script>

{#if document.cookie.includes('ASP.NET_SessionId')}
	{#await getImage(student.picture_id, student.school, document.cookie, abort.signal)}
		<div class="{scale === 1 ? 'w-36 h-48' : 'w-72 h-96'} bg-gray-600 rounded-xl" />
	{:then blob}
		{#if blob}
			<div class="flex flex-col h-min {scale === 1 ? 'w-36' : 'w-72'}">
				<img class="object-cover rounded-xl" src={URL.createObjectURL(blob)} alt="placeholder" />
				{#if name}
					<h3 class="unstyled break-words w-36">{student.name}</h3>
				{/if}
			</div>
		{:else}
			<div class="{scale === 1 ? 'w-36 h-48' : 'w-72 h-96'} bg-red-500 rounded-xl" />
		{/if}
	{:catch error}
		<div class="{scale === 1 ? 'w-36 h-48' : 'w-72 h-96'} bg-red-500 rounded-xl" />
	{/await}
{:else}
	<img src="https://via.placeholder.com/150" alt="placeholder" />
{/if}
