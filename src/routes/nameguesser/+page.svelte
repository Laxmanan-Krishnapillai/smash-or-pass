<script lang="ts">
	import Image from '$lib/components/image.svelte';
	import { cirql } from '$lib/db';
	import { type Student, StudentSchema, ClassSchema } from '$lib/schema';
	import { inside, select } from 'cirql';
	import { writable } from 'svelte/store';
	import { InputChip } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	const students = writable<Student[] | null>(null);
	let classes: string[] = [];
	let activeClass: string[] = [];
	let gamestarted = false;
	let gameended = false;
	let start = 0;
	let scrore = 0;
	const getStudents = async () => {
		console.log(start);
		const res = await cirql.execute({
			query: select()
				.from('student')
				.limit(10)
				.start(start * 10)
				.where('class.name inside $activeClass'),
			schema: StudentSchema,
			params: { activeClass }
		});
		res.length === 0 && (gameended = true);
		students.set(res);
		start++;
		console.log(res);
	};
	onMount(async () => {
		const token = document.cookie.split('token=')[1].split(';')[0];
		if (!cirql.isConnected) {
			cirql.connect();
			await cirql.ready();
			if (!cirql.options.credentials) {
				await cirql.signIn({ token });
				classes = (
					await cirql.execute({
						query: select('name').from('class'),
						schema: ClassSchema.pick({ name: true })
					})
				).map((c) => c.name);
				console.log(classes);
			}
			classes = (
				await cirql.execute({
					query: select('name').from('class'),
					schema: ClassSchema.pick({ name: true })
				})
			).map((c) => c.name);
			console.log(classes);
		}
		if (cirql.options.credentials) {
			classes = (
				await cirql.execute({
					query: select('name').from('class'),
					schema: ClassSchema.pick({ name: true })
				})
			).map((c) => c.name);
			console.log(classes);
		} else {
			await cirql.signIn({ token });
			classes = (
				await cirql.execute({
					query: select('name').from('class'),
					schema: ClassSchema.pick({ name: true })
				})
			).map((c) => c.name);
			console.log(classes);
		}
	});
	const active = writable<Student | null>(null);
	$: if (gamestarted) {
		getStudents();
	}
	let value = '';
	students.subscribe((s) => {
		if (s && s.length > 0) {
			active.set(s[0]);
		}
		if (s && s.length === 0) {
			getStudents();
		}
	});
	const remove = () => {
		students.update((s) => {
			if (s) {
				s.shift();
				return s;
			} else {
				return null;
			}
		});
	};
</script>

<section class="h-screen flex flex-col justify-center items-center">
	<h1 class="text-5xl text-center mb-10">Navne gætter</h1>
	{#if !gamestarted}
		<div class="flex flex-col gap-4">
			<InputChip
				label="Klasser"
				placeholder="Vælg klasser..."
				whitelist={classes}
				bind:value={activeClass}
			/>
			<button
				on:click={() => (gamestarted = true)}
				class="btn variant-filled-secondary w-min mx-auto">Start spil!</button
			>
		</div>
	{/if}
	{#if gamestarted && !gameended}
		<div class="h-48 block">
			{#if $active}
				<Image name={false} student={$active} />
			{/if}
		</div>
		<input
			class="unstyled text-black border-2 border-black mt-4 rounded-lg px-10 py-4 w-96"
			bind:value
			on:keypress={async (e) => {
				if ($active && $students)
					if (e.key === 'Enter') {
						if (value === $active.name.split(' ')[0]) {
							console.log('correct');
							value = '';
							scrore++;
							remove();
						} else {
							console.log('incorrect');
						}
					}
			}}
		/>
	{:else if gameended}
		<h1>Game over</h1>
		<h3>Din scrore blev {scrore}</h3>
	{/if}
</section>
