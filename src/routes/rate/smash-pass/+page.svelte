<script lang="ts">
	import Image from '$lib/components/image.svelte';
	import Switch from '$lib/components/switch.svelte';
	import { cirql } from '$lib/db';
	import { StudentSchema, VotedOnSchema, type Student } from '$lib/schema';
	import { eq, notInside, query, relate, select } from 'cirql';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { dbready } from '$lib/db';
	let isChecked = writable(true);
	// parse uid from cookie
	let uid: string;
	const student = writable<Student | null>(null);
	const initialValue = (() => {
		if (!browser) return [''];
		const students = localStorage.getItem('votedonbefore');
		if (students) {
			const parsed = JSON.parse(students);
			if (Array.isArray(parsed) && parsed.length > 1) {
				return parsed;
			}
		}
		return [];
	})();
	const votedOnBefore = writable<string[]>(initialValue);
	const vote = async (vote: 1 | -1 | 0) => {
		if ($student === null) return;
		console.log($student.id, vote, uid);
		const res = await cirql.execute({
			query: relate(uid, 'voted_on', $student.id).set('vote', vote),
			schema: VotedOnSchema,
			params: {
				uid,
				id: $student.id
			}
		});
		console.log(res);
		votedOnBefore.update((value) => [...value, $student.id]);
		setStudent($isChecked);
	};
	const setStudent = async (checked: boolean) => {
		const res = await cirql.execute({
			query: select()
				.from('student')
				.limit(1)
				.where({
					gender: eq(checked ? 'female' : 'male'),
					id: notInside($votedOnBefore)
				}),
			schema: StudentSchema
		});
		if (res.length === 0) return;
		student.set(res[0]);
	};
	isChecked.subscribe(async (value) => {
		console.log(value);
		await cirql.ready();
		setStudent(value);
	});
	votedOnBefore.subscribe((value) => {
		if (browser) {
			// filter duplicates
			const filtered = value.filter((v, i) => value.indexOf(v) === i);
			console.log(filtered);
			window.localStorage.setItem('votedonbefore', JSON.stringify(filtered));
		}
	});
	onMount(async () => {
		uid = decodeURIComponent(document.cookie)
			.split(';')
			.find((c) => c.includes('uid'))
			.split('=')[1];
	});
	dbready.subscribe(async (value) => {
		if (value) {
			setStudent($isChecked);
		}
	});
</script>

<section class="mx-auto max-w-min flex p-2 gap-2 flex-col items-center h-screen justify-center">
	<Switch bind:isChecked />
	<div class="w-72 h-96 bg-gray-600 rounded-xl">
		{#if $student !== null}
			<!-- <Image scale={2} name={false} student={$student} /> -->
			<img
				class="object-cover w-72 h-96 rounded-xl"
				src="/images/{$student.picture_id}.jpg"
				alt="placeholder"
			/>
		{/if}
	</div>
	<span class="flex justify-between w-full"
		><button on:click={() => vote(true)} class="btn variant-filled-secondary !bg-white rounded-lg"
			><span
				><svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon icon-tabler icon-tabler-heart stroke-none fill-green-400"
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
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
				</svg>
			</span>
			<!-- <span class="">SMASH</span> -->
		</button>
		<button on:click={() => vote(false)} class="btn variant-filled-secondary rounded-lg !bg-white">
			<span
				><svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon icon-tabler icon-tabler-x stroke-secondary-500"
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
					<path d="M18 6l-12 12" />
					<path d="M6 6l12 12" />
				</svg></span
			>
			<!-- <span class="">PASS</span> -->
		</button>
	</span>
</section>
