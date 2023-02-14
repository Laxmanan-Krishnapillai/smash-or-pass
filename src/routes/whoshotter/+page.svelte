<script lang="ts">
	import { onMount } from 'svelte';
	import { cirql } from '$lib/db';
	import { query, create } from 'cirql';
	import Switch from '$lib/components/switch.svelte';
	import { type Student, StudentSchema, EloRatingSchema, VotedOnSchema } from '$lib/schema';
	import Image from '$lib/components/image.svelte';
	import { writable } from 'svelte/store';
	let student1 = writable<Student | null>(null);
	let student2 = writable<Student | null>(null);
	let isChecked = writable(true);
	const getrandomstudents = async (antal: number, gender: boolean) => {
		// whole number between 0 and 500
		const val1 = Math.floor(Math.random() * 500);
		// Another whole number between 0 and 500 (but not the same as the first)
		const val2_check = Math.floor(Math.random() * 500);
		const val2 = val2_check === val1 ? val2_check + 1 : val2_check;
		const res = await cirql.batch(
			{
				query: query(
					`SELECT * FROM student WHERE gender == ${
						gender ? 'female' : 'male'
					} limit 1 start ${val1}`
				).single(),
				schema: StudentSchema
			},
			{
				query: query(
					`SELECT * FROM student WHERE gender == ${
						gender ? 'female' : 'male'
					} limit 1 start ${val2}`
				).single(),
				schema: StudentSchema
			}
		);
		student1.set(res[0]);
		student2.set(res[1]);
		return res;
	};
	onMount(async () => {
		const students = await getrandomstudents(2, $isChecked);
		console.log(students);
	});
	const vote = async (winner: string, loser: string) => {
		const res = await cirql.execute({
			query: create('elo_rating').content({
				winner,
				loser,
				author: winner
			}),
			schema: EloRatingSchema
		});
		console.log(res);
		const students = await getrandomstudents(2, $isChecked);
	};
	isChecked.subscribe(async (val) => {
		const students = await getrandomstudents(2, val);
	});
</script>

<section class="flex items-center justify-center gap-10 h-screen flex-col">
	<Switch bind:isChecked />
	<div class="flex gap-4">
		<button on:click={() => $student1 && $student2 && vote($student1.id, $student2.id)}>
			{#if $student1}
				<Image name={false} student={$student1} />
			{/if}
		</button>
		<button on:click={() => $student1 && $student2 && vote($student2.id, $student1.id)}>
			{#if $student2}
				<Image name={false} student={$student2} />
			{/if}
		</button>
	</div>
</section>
