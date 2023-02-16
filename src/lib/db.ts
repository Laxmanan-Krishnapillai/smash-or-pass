import Surreal from 'surrealdb.js';
import { Cirql } from 'cirql';
import { writable } from 'svelte/store';

const cirql = new Cirql({
	connection: {
		endpoint: 'https://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	}
});
export { cirql };
export const dbready = writable(false);
