<script lang="ts">
	import Image from '$lib/components/image.svelte';
	import { cirql } from '$lib/db';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { type Student, StudentSchema } from '$lib/schema';
	import { select } from 'cirql';
	import { writable } from 'svelte/store';
	import { Stepper, Step } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	const students = writable<Student[] | null>(null);

	const getStudents = async () => {
		const res = await cirql.execute({
			query: select().from('student').limit(10),
			schema: StudentSchema
		});
		console.log(res);
		students.set(res);
		active.set(res[0]);
	};
	onMount(async () => {
		await getStudents();
	});
	const active = writable<Student | null>(null);
	let valueSingle: string = 'books';
</script>

<section class="h-screen flex flex-col justify-center items-center">
	{#if $students && $active}
		<Image name={false} student={$active} />
		<div class="flex flex-col gap-2 mt-8">
			{#each $students.slice(0, 4) as student}
				<button on:click={(e) => {}} class="btn variant-outline-tertiary">{student.name}</button>
			{/each}
		</div>
	{/if}
</section>
