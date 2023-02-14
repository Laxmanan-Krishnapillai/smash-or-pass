import Surreal from 'surrealdb.js';
import type { CirqlStateless } from 'cirql';
import { writable } from 'svelte/store';

const cirql = writable<CirqlStateless | null>(null);

export { cirql };
