import { Cirql } from 'cirql';
import { writable, type Writable } from 'svelte/store';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Student } from '$lib/schema';
const cirql = new Cirql({
	connection: {
		endpoint: 'https://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	}
});
export { cirql };

export const dbready = writable(false);
export const authStudent: Writable<Student | null> = localStorageStore('authStudent', null);
