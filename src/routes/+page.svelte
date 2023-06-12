<script>
	import { slide, fade } from 'svelte/transition';
	import { extractInfo, extract_setting } from '../lib/util';

	const GM_HOST = 'https://trpgpt-gm.vercel.app';
	const PL_HOST = 'https://trpgpt-player-2.vercel.app';

	let gameSetting = 'ダンジョンもので、地下3階のボスを倒せば終了です。';
	/**
	 * @type {any[]}
	 */
	let histories = [];
	let playerNum = 3;
	let loading = false;
	let stat = '';
	let instruction = 'まだセッションが始まっていません。';
	$: summarizedInstruction = extract_setting(instruction);
	let lastMessage = {};
	let candidateMessage = { strength: -1 };
	let actions = [];
	let gameStarted = false;
	let story = 'まだストーリーが始まっていません。';

	const colors = [
		'bg-emerald-800',
		'bg-indigo-800',
		'bg-yellow-800',
		'bg-amber-800',
		'bg-rose-800'
	];

	function getColor(id) {
		let i = id % colors.length;
		return colors[i];
	}

	/**
	 * @type {never[]}
	 */
	let players = [];
	let parsedPlayers = [];

	/**
	 * @param {string} message
	 * @param {number} id
	 * @param {any} from
	 */
	async function proceedPlayer(from, id, message) {
		loading = true;
		stat = `player ${id} is thinking...`;
		return fetch(`${PL_HOST}/api/proceed`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ from: from, id: id, content: message })
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				console.log(candidateMessage);

				loading = false;
				stat = '';
				actions.push(data);
				actions = actions;
				if (candidateMessage.strength < data.strength) {
					candidateMessage = data;
					candidateMessage.from = id;
				}
			})
			.catch((e) => {
				console.log('failed in proceedPlayer');
				console.log(e);
			});
	}

	async function resetPlayers() {
		loading = true;
		stat = `init players...`;
		return fetch(`${PL_HOST}/api/reset`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({})
		})
			.then((res) => res.json())
			.then(() => {
				loading = false;
				stat = '';
			})
			.catch((e) => {
				console.log('failed in resetPlayers');
				console.log(e);
			});
	}

	async function proceedGM() {
		loading = true;
		stat = `GM thinking...`;
		return fetch(`${GM_HOST}/api/proceed`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ from: lastMessage.from, content: lastMessage.content })
		})
			.then((res) => res.json())
			.then((data) => {
				loading = false;
				stat = '';
				if (data.content != '') {
					lastMessage = data;
					lastMessage.from = -1;
					histories.push(lastMessage);
					histories = histories;
				}
				story = data.story;
			})
			.catch((e) => {
				console.log('failed in proceedGM');
				console.log(e);
				return proceedGM();
			});
	}

	// curl -X POST -H "Content-Type: application/json" --data '{"content":"ダンジョンものです"}'  https://trpgpt-gm.vercel.app/api/init
	async function initSession() {
		gameStarted = true;
		loading = true;
		stat = 'initializing the session...';
		console.log('call initSession');

		return fetch(`${GM_HOST}/api/init`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ content: gameSetting })
		})
			.then((res) => res.json())
			.then((data) => {
				loading = false;
				stat = '';
				console.log(data);
				instruction = data.content;
			})
			.catch((e) => {
				console.log('failed in initSession');
				console.log(e);
				return initSession();
			});
	}

	/**
	 * @param {string | number | undefined} [id]
	 */
	async function createCharacter(id) {
		loading = true;
		stat = `Creating a Character ${id}`;
		console.log('call createCharacter');

		return fetch(`${PL_HOST}/api/init`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ text: instruction })
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				loading = false;
				stat = '';
				players.push(data.content);
				players = players;
				return data.content;
			})
			.catch((e) => {
				console.log('failed in createCharacter');
				console.log(e);
				createCharacter(id);
			});
	}

	// $ curl -X POST -H "Content-Type: application/json" --data '{"content":"ダンジョンものです"}'  https://trpgpt-gm.vercel.app/api/init
	async function setUsers() {
		loading = true;
		stat = 'GM thinking about players...';
		console.log('call startSession');

		return fetch(`${GM_HOST}/api/userset`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({ players: players })
		})
			.then((res) => res.json())
			.then(() => {
				loading = false;
				stat = '';
			})
			.catch((e) => {
				console.log('failed in setUsers');
				console.log(e);
				setUsers();
			});
	}

	async function startSession() {
		loading = true;
		stat = 'starting session...';
		console.log('call startSession');

		return fetch(`${GM_HOST}/api/start`, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			//credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				loading = false;
				stat = '';
				lastMessage = data;
				lastMessage.strength = 1;
				lastMessage.from = -1;
				histories.push(lastMessage);
				histories = histories;
			})
			.catch((e) => {
				console.log('failed in startSession');
				console.log(e);
				startSession();
			});
	}

	async function start() {
		console.log(playerNum);
		histories = histories;
		await resetPlayers();
		await initSession();
		for (let i = 0; i < playerNum; i++) {
			let pl = await createCharacter(i);
			parsedPlayers.push(await extractInfo(pl));
			parsedPlayers = parsedPlayers;
		}
		await setUsers();
		let res = await startSession();
		console.log(`startSession result: ${res}`);
		next();
	}

	async function next() {
		let res = await proceedGM();
		console.log(`proceedGM result: ${res}`);
		actions = [];
		candidateMessage = { strength: -1 };
		for (let i = 0; i < playerNum; i++) {
			res = await proceedPlayer(lastMessage.from, i, lastMessage.content);
			console.log(`Player ${i} result: ${res}`);
		}
		lastMessage = candidateMessage;
		histories.push(lastMessage);
		histories = histories;
		next();
	}

	function id2name(id) {
		if (id == -1) {
			return 'GM';
		}
		return parsedPlayers[id].name;
	}
</script>

{#if loading}
	<div class="toast">
		<div class="alert alert-info">
			<span>{stat}</span>
		</div>
	</div>
{/if}

<div class="grid grid-cols-12 gap-4 w-full h-full max-w-fit divide-x divide-neutral-300">
	<div class="col-span-2 h-full max-w-fit">
		<div class="hero">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<h1 class="text-xl font-bold">Game Settings</h1>
					<p transition:fade class="py-6">
						{#await summarizedInstruction}
							creating...
						{:then inst}
							{inst}
						{:catch e}
							failed. {e}
						{/await}
					</p>
				</div>
			</div>
		</div>

		<div class="hero">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<h1 class="text-xl font-bold">Story Outline</h1>
					<p transition:fade class="py-6">
						{story}
					</p>
				</div>
			</div>
		</div>
	</div>
	<div class="col-span-7 overflow-y-auto">
		<section>
			{#each histories as utterance}
				{#if utterance.from == -1}
					<div transition:slide class="chat chat-start w-full">
						<div class="avatar placeholder">
							<div class="bg-neutral-focus text-neutral-content rounded-full w-24">
								<span class="text-3xl">{id2name(utterance.from)}</span>
							</div>
						</div>
						<div class="chat-bubble w-30">{utterance.content}</div>
					</div>
				{:else}
					<div transition:slide class="chat chat-end w-full">
						<div class="chat-bubble w-30 {getColor(utterance.from)}">{utterance.content}</div>
						<div class="avatar placeholder">
							<div
								class="bg-neutral-focus text-neutral-content rounded-full w-24 {getColor(
									utterance.from
								)}"
							>
								<span class="text-3xl">{id2name(utterance.from)}</span>
							</div>
						</div>
					</div>
				{/if}
			{/each}

			<div class="w-full p-10">
				{#if !gameStarted}
					<div class="flex">
						<div class="form-control w-full basis-1/6">
							<label class="label block">
								<span class="label-text">Player Num</span>
								<input
									type="number"
									placeholder="Player Num"
									bind:value={playerNum}
									class="input input-bordered w-full"
								/>
							</label>
						</div>
						<div class="form-control w-full basis-5/6">
							<label class="label block w-full">
								<span class="label-text">Game Config</span>
								<input
									type="text"
									placeholder="Game Config"
									bind:value={gameSetting}
									class="input input-bordered w-full"
								/>
							</label>
						</div>
					</div>
					<div class="w-fill text-center">
						<button class="btn" on:click={start}> start </button>
					</div>
				{/if}
			</div>
		</section>
	</div>
	<div class="col-span-3 max-w-fit">
		<div class="hero">
			<div class="hero-content text-center">
				<div class="">
					<h1 class="text-xl font-bold">Player Characters</h1>
					<div class="overflow-x-auto">
						<table class="table">
							<!-- head -->
							<thead>
								<tr>
									<th>name</th>
									<th>parameter</th>
								</tr>
							</thead>
							<tbody>
								{#each parsedPlayers as player, i}
									<tr transition:fade>
										<td>
											{#await player}
												Creating...
											{:then pl}
												{pl.name}
											{/await}
										</td>
										<td>
											{#await player}
												Creating...
											{:then pl}
												{JSON.stringify(pl.parameter)}
											{/await}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
