<script lang="ts">
	import { cirql } from '$lib/db';
	import { writable, type Writable } from 'svelte/store';
	import { InputChip, localStorageStore } from '@skeletonlabs/skeleton';
	import Switch from '$lib/components/switch.svelte';
	import { ClassSchema, StudentSchema, type Student } from '$lib/schema';
	import { query, select } from 'cirql';
	import { dbready } from '$lib/db';
	let isChecked = writable(true);
	let classes: Writable<string[]> = localStorageStore('classes', ['']);
	let activeClass: string[] = [];
	$: gender = $isChecked ? 'female' : 'male';
	dbready.subscribe(async (ready) => {
		console.log('ready');
		if (!ready) return;
		if ($classes.length > 1) return;
		const res = (
			await cirql.execute({
				query: select('name').from('class'),
				schema: ClassSchema.pick({ name: true })
			})
		).map((c) => c.name);
		classes.set(res);
		console.log(classes);
	});
	let val: string = '';
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
								val.length > 0 ? `string::startsWith(name, $val) AND ` : ''
							}gender == $gender ${
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
	isChecked.subscribe(async (gval) => {
		console.log(val, activeClass, gender);
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
						gender: gval ? 'female' : 'male',
						val,
						activeClass
					}
				})
			).filter((student) => student !== undefined);
			students.set(newStudents);
		} else {
			students.set([]);
		}
	});
</script>

<svelte:head>
	<title>Find en elev</title>
</svelte:head>
<section class="flex flex-col items-center justify-center gap-4 h-[80vh]">
	<h1 class="text-6xl font-thin text-center mb-6">Find en elev</h1>
	<Switch bind:isChecked />
	<input
		class="unstyled text-black border-2 border-black rounded-lg px-10 py-4 w-96"
		on:change={(e) => {
			console.log(e);
		}}
		bind:value={val}
	/>
	<span class="flex">
		<InputChip
			allowUpperCase
			name="klasse"
			class=""
			label="Klasser"
			placeholder="Vælg klasser..."
			whitelist={classes}
			bind:value={activeClass}
		/>
	</span>
</section>
<section class="grid grid-cols-[repeat(auto-fit,_144px)] justify-center gap-8 md:p-20" id="images">
	{#each $students as student, i}
		<!-- {#if i < 15}
			<Image {student} />
		{:else}
			{#await new Promise((r) => setTimeout(r, 100 * i))}
				<div class="w-36 h-48 bg-gray-600 rounded-xl" />
			{:then}
				<Image {student} />
			{/await}
		{/if} -->
		<div class="flex flex-col h-min w-36">
			<div class="bg-gray-600 w-full h-48 rounded-xl">
				<img
					class="object-cover rounded-xl"
					src="/images/{student.picture_id}.jpg"
					alt="placeholder"
				/>
			</div>
			<h3 class="unstyled break-words w-full">{student.name}</h3>
		</div>
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
