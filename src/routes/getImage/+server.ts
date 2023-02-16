import type { RequestHandler } from '@sveltejs/kit';
import { Client } from '$lib/lectio';
export const POST: RequestHandler = async ({ request, cookies }) => {
	const { id, school } = await request.json();
	const sessionId = cookies.get('ASP.NET_SessionId');
	if (!id || !school || !sessionId) return new Response('Missing parameters', { status: 400 });
	return new Response(await getImage(id, school, sessionId));
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
