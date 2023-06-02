<script>
	import { slide, fade } from 'svelte/transition';
	import { extractInfo, extract_setting } from '../lib/util'

	const GM_HOST="https://trpgpt-gm.vercel.app"
	const PL_HOST="https://trpgpt-player-2.vercel.app"

	let gameSetting =
		'ダンジョンもので、地下3階のボスを倒せば終了です。';
	/**
	 * @type {any[]}
	 */
	let histories = [];
	let playerNum = 3;
	let loading = false;
	let stat = '';
	let instruction = '';
	$: summarizedInstruction = extract_setting(instruction);
	let lastMessage = {};
	let gameStarted = false;
	
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
				loading = false;
				stat = '';
				if (lastMessage.strength < data.strength) {
					lastMessage = data;
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
			.then((data) => {
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
			body: JSON.stringify({ from: lastMessage.id, content: lastMessage.content })
		})
			.then((res) => res.json())
			.then((data) => {
				loading = false;
				stat = '';
				if (data.content != "") {
					data.id = -1;
					histories.push(data);
					histories = histories;
				}
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
			.then((data) => {
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
				lastMessage.id = -1;
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
			await createCharacter(i);
			parsedPlayers.push(extractInfo(players[i]));
		}
		await setUsers();
		await startSession();
		next();
	}

	async function next() {
		await proceedGM();
		if (lastMessage.content != '') {
			for (let i = 0; i < playerNum; i++) {
				await proceedPlayer(lastMessage.id, i, lastMessage.content);
			}
			histories.push({ lastMessage });
			histories = histories;
		}
		next();
	}
</script>

{#if loading}
	<div class="toast">
		<div class="alert alert-info">
			<span>{stat}</span>
		</div>
	</div>
{/if}

<div class="flex">
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
		<div class="">
			<h1 class="text-xl font-bold">Players Settings</h1>
			<div class="overflow-x-auto">
				<table class="table">
					<!-- head -->
					<thead>
						<tr>
							<th />
							<th>id</th>
							<th>description</th>
							<th>parsed</th>
						</tr>
					</thead>
					<tbody>
						{#each players as player, i}
							<tr transition:fade >
								<th>1</th>
								<td>{i}</td>
								<td>{player}</td>
								<td>
									{#await parsedPlayers[i]}
									  parsing...
									{:then p}
									 {JSON.stringify(p)}
								    {:catch e}
									 Failed. {e}
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


<section>
	{#each histories as utterance}
		<div transition:slide class="chat chat-start w-full">
			<!-- <div class="chat-image avatar">
				<div class="w-10 rounded-full">
					<img src="" />
				</div>
			</div> -->
			<div>
				{utterance.id}
			</div>
			<div class="chat-bubble w-30">{utterance.content}</div>
			<!-- <img src={ThumbsUp} /> <img src={ThumbsDown} /> -->
		</div>
	{/each}

	<div class="">
		{#if !gameStarted}
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text">Game Config</span>
					<input
						type="text"
						placeholder="Game Config"
						bind:value={gameSetting}
						class="input input-bordered w-full max-w-xs"
					/>
				</label>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label">
					<span class="label-text">Player Num</span>
					<input
						type="number"
						placeholder="Player Num"
						bind:value={playerNum}
						class="input input-bordered w-full max-w-xs"
					/>
				</label>
			</div>

			<button class="btn" on:click={start}> start </button>
		{/if}
		{#if !loading}
			<button class="btn" on:click={next}> next </button>
		{/if}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
