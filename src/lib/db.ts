import Surreal from 'surrealdb.js';
import { Cirql } from 'cirql';
import { writable } from 'svelte/store';

const cirql = new Cirql({
	connection: {
		endpoint: 'wss://surrealhost.fly.dev/',
		namespace: 'lectio',
		database: 'main'
	}
});
export { cirql };
