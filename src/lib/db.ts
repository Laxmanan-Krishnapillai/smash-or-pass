import { Cirql } from 'cirql';
import { writable } from 'svelte/store';
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
export const authStudent = writable<Student | null>(null);
