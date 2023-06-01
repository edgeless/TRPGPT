<script>

	let gameSetting = "\
	aaa\
	";
	let histories = [
		{id: -1, content:"GM発言"},
		{id: 0, content:"PL0発言"},
		{id: 1, content:"PL1発言"}
	]
	let playerNum = 3;
	let loading = false;
	let stat = ""
	let instruction = "";
	let lastMessage = {};
	/**
	 * @type {never[]}
	 */
	let players = [];

	/**
	 * @param {string} message
	 * @param {number} id
	 * @param {any} from
	 */
	async function proceedPlayer(from, id, message){
		loading = true;
		stat = `player ${id} is thinking...`;
		fetch('https://trpgpt-player.vercel.app/api/chat', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify({"from": from, "id": id, "content": message}) 
		}).then((res) => res.json())
		.then((data) => {
			loading = false;
			histories.push(data.content);
			histories = histories;
			if(lastMessage.strength < data.strength) {
				lastMessage = data
			}
			loading = false;
			stat = "";
		}).catch((e) => {
			console.log("failed in proceedPlayer");
			console.log(e);
		})
	}

	/**
	 * @param {string} message
	 */
	async function proceedGM(message){
		loading = true;
		stat = `GM thinking...`;
		fetch('https://trpgpt-gm.vercel.app/api/proceed', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify(message) 
		}).then((res) => res.json()) 
		.then((data) => {
			loading = false;
			stat = ""
			histories.push(data);
			histories = histories})
		.catch((e) => {
			console.log("failed in proceedGM");
			console.log(e);
		})
	}

	async function initSession(){
		loading = true;
		stat = "initializing the session...";
		console.log("call initSession");

		fetch('https://trpgpt-gm.vercel.app/api/init', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify({"content": gameSetting}) 
		}).then((res) => res.json())
		.then((data) => {
			loading = false;
			stat = "";
			console.log(data);
			instruction = data.content;
		})
		.catch((e) => {
			console.log("failed in initSession");
			console.log(e);
		})
	}

	/**
	 * @param {string | number | undefined} [id]
	 */
	async function createCharacter(id){
		loading = true;
		stat = `Creating a Character ${id}`
		console.log("call createCharacter");

		fetch('https://trpgpt-player.vercel.app/api/init', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify({"text": instruction}) 
		}).then((res) => res.json()) 
		.then((data) => {
			console.log(data);
			loading = false;
			stat = "";
			players[id] = data.content
		}).catch((e) => {
			console.log(e);
			console.log(e.message());
		})
	}

	async function setUsers(){
		loading = true;
		stat = "GM thinking about players..."
		console.log("call startSession");

		fetch('https://trpgpt-gm.vercel.app/api/userset', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify({"players": players}) 
		}).then((res) => res.json())
		.then((data) => {
			loading = false;
			stat = "";
		})
		.catch((e) => {
			console.log("failed in startSession");
			console.log(e);
		})
	}

	async function startSession(){
		loading = true;
		console.log("call startSession");

		fetch('https://trpgpt-gm.vercel.app/api/start', {
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
		}).then((res) => res.json()) // FIXME to json
		.then((data) => {
			console.log(data);
			histories.push(data.content);
			lastMessage = data;
			lastMessage.strength = 1;
			lastMessage.id = -1;
		})
		.catch((e) => {
			console.log("failed in startSession");
			console.log(e);
		})
	}

	async function start() {
		console.log(playerNum);
		histories = histories;
		await initSession();
		for(let i=0;  i<playerNum; i++) {
			await createCharacter();
		}
		await setUsers();
		await startSession();
	}

	async function next() {
		await proceedGM("");
		for(let i=0;  i<playerNum; i++) {
			await proceedPlayer(lastMessage.id, i, lastMessage.content);
		}
		histories.push({lastMessage})
	}

</script>

{#if loading}
  <div>{stat}</div>
{/if}

<section>
	<div>
		{#each histories as utterance}
			<pre> {utterance.id}: {utterance.content} </pre>
		{/each}
	</div>

	<input type="text" placeholder="Player Num" bind:value={playerNum} 
		class="input input-bordered w-full max-w-xs" />
	<button on:click={start}> start </button>
	<button on:click={next}> next </button>
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
