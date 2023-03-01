import qs from 'qs';
import { JSDOM } from 'jsdom';
interface ClientConstructorParams {
	username: string;
	password: string;
	schoolId: string;
}

/**
 * Represents the client.
 */
export class Client {
	#schoolId: string;
	#username: string;
	#password: string;
	#lectiogsc = '';
	#sessionId = '';
	#lectioTicket = '';
	#expires = '';
	public constructor({ schoolId, username, password }: ClientConstructorParams) {
		this.#schoolId = schoolId;
		this.#username = username;
		this.#password = password;
	}

	/**
	 * Get the lectioId
	 * @return {string} - The lectioId
	 */

	/**
	 * Get the schoolId
	 * @return {string} - The schoolId
	 */
	public get schoolId(): string {
		return this.#schoolId;
	}

	/**
	 * Get the sessionId
	 * @return {string} - The sessionId
	 */
	public get sessionId(): string {
		return this.#sessionId;
	}

	/**
	 * Get the lectiogsc
	 * @return {string} - The lectiogsc
	 */
	public get lectiogsc(): string {
		return this.#lectiogsc;
	}

	/**
	 * Get the lectioTicket
	 * @return {string} - The lectioTicket
	 */
	public get lectioTicket(): string {
		return this.#lectioTicket;
	}

	/**
	 * Get the username
	 * @return {string} - The username
	 */
	public get username(): string {
		return this.#username;
	}
	/**
	 * Get the expiry date
	 * @return {string} - The expiry date
	 */
	public get expires(): string {
		return this.#expires;
	}
	/**
	 * Authenticate the user
	 * @async
	 * @return {Promise<boolean>} - Whether the login was successful or not
	 */
	public async authenticate(): Promise<boolean> {
		const url = `https://www.lectio.dk/lectio/${this.#schoolId}/login.aspx`;

		const requestBody = await fetch(url)
			.then((res) => {
				return res.text();
			})
			.then((res) => this.extractRequestBody(res))
			.catch((error) => {
				throw error;
			});
		await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: qs.stringify(requestBody),
			redirect: 'manual'
		})
			.then(async (res) => {
				const resHtml = await res.text();
				if (
					resHtml.includes('Der er ikke oprettet en adgangskode til dette login. Kontakt en lærer.')
				)
					throw new Error('No user with the specified username exists for the specified school.');
				else if (resHtml.includes('Fejl i Brugernavn og/eller adgangskode. Prøv igen eller:'))
					throw new Error('Wrong password for the specified username.');
				else if (resHtml.includes('Fejl - Lectio')) throw new Error('Authentication failed.');
				else if (res.headers.get('location') === '/lectio/CRAPPYLECTIOURL_login.aspx')
					throw new Error('Page does not exist.');

				const cookies = res.headers.get('set-cookie')?.split('; ');

				if (!cookies) return;
				this.#lectiogsc = cookies[0].split('lectiogsc=')[1];
				this.#sessionId = cookies[3].split('ASP.NET_SessionId=')[1];
				console.log(this.#sessionId);
				this.#lectioTicket = cookies[7].split('LectioTicket=')[1];
				this.#expires = cookies[11].split('expires=')[1];
				console.log(cookies);
			})
			.catch((error) => {
				throw error;
			});
		return !!this.#lectiogsc && !!this.#lectioTicket && !!this.#sessionId;
	}

	/**
	 * Extract the request body from the /login.aspx page
	 * @param pageBody - The HTML of the page
	 * @private
	 */
	private extractRequestBody(pageBody: string) {
		const dom = new JSDOM(pageBody).window.document;

		return {
			__EVENTTARGET: 'm$Content$submitbtn2',
			__EVENTARGUMENT: '',
			__VIEWSTATEX: (dom.querySelector('#__VIEWSTATEX') as HTMLInputElement | null)?.value,
			__EVENTVALIDATION: (dom.querySelector('#__EVENTVALIDATION') as HTMLInputElement | null)
				?.value,
			m$Content$username: this.#username,
			m$Content$password: this.#password,
			m$Content$AutologinCbx: 'on'
		};
	}
}
