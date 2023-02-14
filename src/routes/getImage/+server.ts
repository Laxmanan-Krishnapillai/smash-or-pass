import type { RequestHandler } from '@sveltejs/kit';
import { Client } from '$lib/lectio';
export const POST: RequestHandler = async ({ request }) => {
	const { id, school } = await request.json();
	const sessionId = request.headers.get('Cookie')?.split('ASP.NET_SessionId=')[1];
	console.log(sessionId);
	if (!id || !school) return new Response('Missing parameters', { status: 400 });
	if (!sessionId) {
		const client = new Client({
			username: 'siva0077',
			password: '00TestKedel.',
			schoolId: '57'
		});
		const worked = await client.authenticate();
		return new Response(await getImage(id, school, client.sessionId), {
			headers: { Cookie: 'ASP.NET_SessionId=' + client.sessionId }
		});
	} else {
		return new Response(await getImage(id, school, sessionId));
	}
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
		.then((res) => {
			return res.blob();
		})
		.catch((error) => {
			throw error;
		});
};
