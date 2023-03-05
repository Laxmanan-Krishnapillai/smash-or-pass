<script lang="ts">
	import { onMount } from 'svelte';
	import { cirql } from '$lib/db';
	import { query, create, countRecord, count, eq } from 'cirql';
	import Switch from '$lib/components/switch.svelte';
	import { type Student, StudentSchema, EloRatingSchema, ClassSchema } from '$lib/schema';
	import { Paginator } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';
	import { z } from 'zod';
	import { dbready } from '$lib/db';
	let student1 = writable<(Student & { cname?: string }) | null>(null);
	let student2 = writable<(Student & { cname?: string }) | null>(null);
	let isChecked = writable(true);
	let rank: (Student & { cname?: string })[] | null = null;
	Paginator;
	let settings = writable({
		offset: 0,
		limit: 10,
		size: 0,
		amounts: [1, 2, 5, 10, 20, 50, 100]
	});
	const updaterank = async () => {
		const res = await cirql.execute({
			query: query(
				`SELECT *, class.name as cname FROM student WHERE gender == $gender ORDER BY elo DESC LIMIT ${
					$settings.limit
				} START ${$settings.offset * $settings.limit}`
			),
			schema: StudentSchema.merge(z.object({ cname: z.string().optional() })),
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
					`SELECT *, class.name as cname FROM student WHERE gender == $gender limit 1 start ${val1}`
				).single(),
				schema: StudentSchema.merge(z.object({ cname: z.string().optional() })),
				params: {
					gender: gender ? 'female' : 'male'
				}
			},
			{
				query: query(
					`SELECT *, class.name as cname FROM student WHERE gender == $fender limit 1 start ${val2}`
				).single(),
				params: {
					fender: gender ? 'female' : 'male'
				},
				schema: StudentSchema.merge(z.object({ cname: z.string().optional() }))
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
			const size = await cirql.execute({
				query: count('student').where({
					gender: eq($isChecked ? 'female' : 'male')
				})
			});
			settings.update((s) => {
				return {
					...s,
					size
				};
			});
			await getrandomstudents(2, $isChecked);
			console.log($isChecked);
			await updaterank();
		}
	});
	const vote = async (winner: string, loser: string) => {
		cirql.execute({
			query: create('elo_rating').content({
				winner,
				loser,
				author: uid
			}),
			schema: EloRatingSchema
		});

		const students = await getrandomstudents(2, $isChecked);
		console.log(students);
	};
	isChecked.subscribe(async (val) => {
		await cirql.ready();
		const size = await cirql.execute({
			query: count('student').where({
				gender: eq($isChecked ? 'female' : 'male')
			})
		});
		settings.update((s) => {
			return {
				...s,
				size
			};
		});
		getrandomstudents(2, val);
		updaterank();
	});
	let width = 0;
</script>

<svelte:window bind:innerWidth={width} />
<section class="flex items-center justify-center gap-10 h-max mt-40 flex-col">
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
	<button
		on:click={() => getrandomstudents(2, $isChecked)}
		class="btn variant-ghost-tertiary rounded-lg"
	>
		SKIP
	</button>
</section>
<section class="flex flex-col max-w-xl h-screen mt-20 mx-auto px-4 md:px-20 gap-4">
	<h1>Rank</h1>
	<Paginator
		amountText="Person(er)"
		on:page={async () => {
			await updaterank();
		}}
		on:amount={async () => {
			await updaterank();
		}}
		settings={$settings}
	/>
	{#if rank}
		<div class="card">
			<dl class="list-dl max-h-96 overflow-scroll">
				{#each rank as student}
					<div>
						<span
							><img
								src="/images/{student.picture_id}.jpg"
								class="rounded-full w-10 h-10 object-cover"
							/></span
						>
						<span class="flex-auto">
							<dt>{student.name} ({student.cname})</dt>
							<dd>{student.elo.toFixed()}</dd>
						</span>
					</div>
				{/each}
			</dl>
		</div>
	{/if}
</section>
