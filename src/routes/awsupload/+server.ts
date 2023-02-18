import type { RequestHandler } from '@sveltejs/kit';
import { Client } from '$lib/lectio';
import { writeFile } from 'fs/promises';
import { cirql } from '$lib/server/db';
import { select } from 'cirql';
import { StudentSchema } from '$lib/schema';
export const GET: RequestHandler = async ({ request, cookies }) => {
	const sessionId = cookies.get('ASP.NET_SessionId');
	if (!sessionId) return new Response('Missing parameters', { status: 400 });
	const students = await cirql.execute({
		query: select('picture_id').from('student'),
		schema: StudentSchema.pick({ picture_id: true })
	});
	// fetch all images but wait 1 second between each request
	for (let i = 0; i < students.length; i++) {
		await getImage(students[i].picture_id, '57', sessionId);
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	return new Response('ok');
};

const getImage = async (imageId: string, school: string, sessionId: string) => {
	return await fetch(
		`https://www.lectio.dk/lectio/${school}/GetImage.aspx?pictureid=${imageId}&${'fullsize=1'}`,
		{
			headers: {
				Cookie: 'ASP.NET_SessionId=' + sessionId
			}
		}
	)
		.then(async (res) => {
			if (!res.ok) throw new Error('Failed to fetch image');
			// save image to file
			const temp = res;
			const buffer = await temp.arrayBuffer();
			// prefix path with full path to project root
			writeFile(
				`C:/Users/Lenovo/Desktop/dev/surreal-lectio-skeleton/src/public/images/${imageId}.jpg`,
				Buffer.from(buffer)
			);
		})
		.catch((error) => {
			throw error;
		});
};
