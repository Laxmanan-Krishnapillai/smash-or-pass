<script lang="ts">
	import { cirql } from '$lib/db';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Image from '$lib/components/image.svelte';
	import { InputChip } from '@skeletonlabs/skeleton';
	import { ClassSchema, StudentSchema, type Student } from '$lib/schema';
	import { query, select } from 'cirql';
	import { dbready } from '$lib/db';
	let imgcontainer: HTMLElement;
	let gender: 'female' | 'male' = 'female';
	let classes: string[] = [];
	let activeClass: string[] = [];
	dbready.subscribe(async (ready) => {
		if (!ready) return;
		classes = (
			await cirql.execute({
				query: select('name').from('class'),
				schema: ClassSchema.pick({ name: true })
			})
		).map((c) => c.name);
		console.log(classes);
	});
	let val = '';
	const students = writable<Student[]>([]);
	// throttle get image function
	// const getImage = throttle(async (id) => {
	// 	const blob = await db.getImage(id);
	// 	return blob;
	// }, 1000);
	let debounceTimeout: NodeJS.Timeout;
	$: {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			if (val.length > 0 || activeClass.length > 0) {
				const newStudents = (
					await cirql.execute({
						query: query(
							`SELECT * FROM student WHERE ${
								val.length > 0 ? `string::startsWith(name, $val) AND` : ''
							} gender == $gender ${
								activeClass.length > 0 ? `AND class.name inside $activeClass` : ''
							}`
						),
						schema: StudentSchema,
						params: {
							gender,
							val,
							activeClass
						}
					})
				).filter((student) => student !== undefined);
				students.set(newStudents);
			} else {
				students.set([]);
			}
		}, 500);
	}
	students.subscribe((im) => {
		console.log(im);
	});
</script>

<section class="flex flex-col items-center justify-center gap-4 h-[80vh]">
	<h1 class="text-6xl font-thin text-center mb-6">Find en elev</h1>
	<span class="flex gap-2 h-min">
		<button
			on:click={() => {
				gender = 'male';
			}}
			class="btn {gender === 'male'
				? 'variant-filled-secondary'
				: 'variant-ringed-secondary'} btn-base"
		>
			Mand
		</button>
		<button
			on:click={() => {
				gender = 'female';
			}}
			class="btn {gender === 'female'
				? 'variant-filled-secondary'
				: 'variant-ringed-secondary'} btn-base"
		>
			Kvinde
		</button>
	</span>
	<input
		class="unstyled text-black border-2 border-black rounded-lg px-10 py-4 w-96"
		bind:value={val}
	/>
	<span class="flex">
		<InputChip
			allowUpperCase
			class=""
			label="Klasser"
			placeholder="Vælg klasser..."
			whitelist={classes}
			bind:value={activeClass}
		/>
	</span>
</section>
<section
	class="grid grid-cols-[repeat(auto-fit,_180px)] justify-center gap-3 px-20"
	bind:this={imgcontainer}
	id="images"
>
	{#each $students as student, i}
		{#if i < 15}
			<Image {student} />
		{:else}
			{#await new Promise((r) => setTimeout(r, 100 * i))}
				<div class="w-36 h-48 bg-gray-600 rounded-xl" />
			{:then}
				<Image {student} />
			{/await}
		{/if}
	{/each}
</section>

<style>
	html,
	body,
	#images {
		scroll-behavior: smooth;
	}
	.reverse-spinner {
		width: 180px;
		background: top/100% 50% no-repeat;
		background-image: radial-gradient(
			farthest-side at bottom,
			transparent 95%,
			#000000 96% 99%,
			transparent 100%
		);
		animation: spin 1.5s linear infinite;
	}

	.reverse-spinner::before {
		content: '';
		display: block;
		padding-top: 100%;
		background: inherit;
		background-image: radial-gradient(
			farthest-side at bottom,
			transparent 73%,
			rgb(27, 30, 31) 74% 79%,
			transparent 80%
		);
		animation: spin 0.5s linear infinite reverse;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
