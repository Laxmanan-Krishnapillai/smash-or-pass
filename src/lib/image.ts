export async function getImage(id: string, school: string, signal: AbortSignal): Promise<Blob> {
	// wait between requests
	const res = await fetch('/getImage', {
		signal: signal,
		method: 'POST',
		body: JSON.stringify({
			id,
			school
		})
	});
	return res.blob();
}
