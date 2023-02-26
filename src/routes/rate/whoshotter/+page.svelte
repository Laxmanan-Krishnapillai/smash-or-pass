<script lang="ts">
	import { onMount } from 'svelte';
	import { cirql } from '$lib/db';
	import { query, create } from 'cirql';
	import Switch from '$lib/components/switch.svelte';
	import { type Student, StudentSchema, EloRatingSchema } from '$lib/schema';
	import { Paginator } from '@skeletonlabs/skeleton';
	import Image from '$lib/components/image.svelte';
	import { writable } from 'svelte/store';
	import { dbready } from '$lib/db';
	let student1 = writable<Student | null>(null);
	let student2 = writable<Student | null>(null);
	let isChecked = writable(true);
	let rank: null | Student[] = null;
	let settings = {
		offset: 0,
		limit: 2,
		size: 600,
		amounts: [1, 2, 5, 10]
	};
	const updaterank = async () => {
		const res = await cirql.execute({
			query: query(
				`SELECT * FROM student WHERE gender == $gender ORDER BY elo DESC LIMIT ${
					settings.limit
				} START ${settings.offset * settings.limit}`
			),
			schema: StudentSchema,
			params: {
				gender: $isChecked ? 'female' : 'male'
			}
		});
		rank = res;
	};
	let uid: string | null = null;
	const getrandomstudents = async (antal: number, gender: boolean) => {
		// whole number between 0 and 500
		const val1 = Math.floor(Math.random() * 500);
		// Another whole number between 0 and 500 (but not the same as the first)
		const val2_check = Math.floor(Math.random() * 500);
		const val2 = val2_check === val1 ? val2_check + 1 : val2_check;
		const res = await cirql.batch(
			{
				query: query(
					`SELECT * FROM student WHERE gender == $gender limit 1 start ${val1}`
				).single(),
				schema: StudentSchema,
				params: {
					gender: gender ? 'female' : 'male'
				}
			},
			{
				query: query(
					`SELECT * FROM student WHERE gender == $fender limit 1 start ${val2}`
				).single(),
				params: {
					fender: gender ? 'female' : 'male'
				},

				schema: StudentSchema
			}
		);
		student1.set(res[0]);
		student2.set(res[1]);
		return res;
	};
	onMount(async () => {
		// get uid from cookie
		uid = decodeURIComponent(document.cookie)
			.split(';')
			.find((c) => c.includes('uid'))
			.split('=')[1];
	});
	dbready.subscribe(async (val) => {
		if (val) {
			await getrandomstudents(2, $isChecked);
			console.log($isChecked);
			await updaterank();
		}
	});
	const vote = async (winner: string, loser: string) => {
		const res = await cirql.execute({
			query: create('elo_rating').content({
				winner,
				loser,
				author: uid
			}),
			schema: EloRatingSchema
		});
		console.log(res);
		const students = await getrandomstudents(2, $isChecked);
		console.log(students);
	};
	isChecked.subscribe(async (val) => {
		await cirql.ready();
		await getrandomstudents(2, val);
		await updaterank();
	});
</script>

<section class="flex items-center justify-center gap-10 h-screen flex-col">
	<Switch bind:isChecked />
	<div class="flex gap-4">
		<button on:click={() => $student1 && $student2 && vote($student1.id, $student2.id)}>
			{#if $student1}
				<!-- <Image name={false} student={$student1} /> -->
				<div class="flex flex-col h-48 w-36">
					<img
						class="object-cover rounded-xl"
						src="/images/{$student1.picture_id}.jpg"
						alt="placeholder"
					/>
				</div>
			{/if}
		</button>
		<button on:click={() => $student1 && $student2 && vote($student2.id, $student1.id)}>
			{#if $student2}
				<!-- <Image name={false} student={$student2} /> -->
				<div class="flex flex-col h-48 w-36">
					<img
						class="object-cover rounded-xl"
						src="/images/{$student2.picture_id}.jpg"
						alt="placeholder"
					/>
				</div>
			{/if}
		</button>
	</div>
</section>
<section class="flex flex-col h-screen px-20 gap-4">
	<h1>Rank</h1>
	<Paginator
		on:page={async () => {
			await updaterank();
		}}
		on:amount={async () => {
			await updaterank();
		}}
		bind:settings
	/>
	{#if rank}
		{#each rank as student}
			<div class="flex items-center gap-4">
				<div class="w-36 h-48 bg-gray-600 rounded-xl">
					<img
						class="object-cover rounded-xl"
						src="/images/{student.picture_id}.jpg"
						alt="placeholder"
					/>
				</div>
				<p>{student.name}</p>
				<p>{student.elo}</p>
			</div>
		{/each}
	{/if}
</section>
