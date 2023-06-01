<script>

	let gameSetting = "\
	ダンジョンもので、地下3階のボスを倒せば終了です。\
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
	let gameStarted = false;

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
		return fetch('https://trpgpt-player.vercel.app/api/chat', {
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
	async function proceedGM(){
		loading = true;
		stat = `GM thinking...`;
		return fetch('https://trpgpt-gm.vercel.app/api/proceed', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			//credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify({"from": lastMessage.id, "content": lastMessage.content}) 
		}).then((res) => res.json()) 
		.then((data) => {
			loading = false;
			stat = ""
			histories.push(data);
			histories = histories})
		.catch((e) => {
			console.log("failed in proceedGM");
			console.log(e);
			return proceedGM();
		})
	}

	// curl -X POST -H "Content-Type: application/json" --data '{"content":"ダンジョンものです"}'  https://trpgpt-gm.vercel.app/api/init
	async function initSession(){
		gameStarted = true;
		loading = true;
		stat = "initializing the session...";
		console.log("call initSession");
		
		
		return fetch('https://trpgpt-gm.vercel.app/api/init', {
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
			return initSession();
		})
	}

	/**
	 * @param {string | number | undefined} [id]
	 */
	async function createCharacter(id){
		loading = true;
		stat = `Creating a Character ${id}`
		console.log("call createCharacter");

		return fetch('https://trpgpt-player.vercel.app/api/init', {
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
			players.push(data.content);
			players = players
		}).catch((e) => {
			console.log("failed in createCharacter");
			console.log(e);
			createCharacter(id);
		})
	}

	async function setUsers(){
		loading = true;
		stat = "GM thinking about players..."
		console.log("call startSession");

		return fetch('https://trpgpt-gm.vercel.app/api/userset', {
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
			console.log("failed in setUsers");
			console.log(e);
			setUsers();
		})
	}

	async function startSession(){
		loading = true;
		stat = "starting session..."
		console.log("call startSession");

		return fetch('https://trpgpt-gm.vercel.app/api/start', {
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
		}).then((res) => res.json())
		.then((data) => {
			console.log(data);
			loading = false;
			stat = "";
			lastMessage = data;
			lastMessage.strength = 1;
			lastMessage.id = -1;
			histories.push(lastMessage);
			histories = histories
		})
		.catch((e) => {
			console.log("failed in startSession");
			console.log(e);
			startSession();
		})
	}

	async function start() {
		console.log(playerNum);
		histories = histories;
		await initSession();
		for(let i=0;  i<playerNum; i++) {
			await createCharacter(i);
		}
		await setUsers();
		await startSession();
	}

	async function next() {
		await proceedGM();
		if(lastMessage.content != "") {

			for(let i=0;  i<playerNum; i++) {
				await proceedPlayer(lastMessage.id, i, lastMessage.content);
			}
			histories.push({lastMessage})
			histories = histories;
		}
	}

</script>

{#if loading}
<div class="toast">
	<div class="alert alert-info">
	  <span>{stat}</span>
	</div>
  </div>
{/if}

Game setting:
{instruction}

Players:
<section>
	<div class="overflow-x-auto">
		<table class="table">
		  <!-- head -->
		  <thead>
			<tr>
			  <th></th>
			  <th>id</th>
			  <th>description</th>
			</tr>
		  </thead>
		  <tbody>
			{#each players as player,i}
			<tr>
			  <th>1</th>
			  <td>{i}</td>
			  <td>{player}</td>
			</tr>
			{/each}
		  </tbody>
		</table>
	  </div>
</section>

<section>
	{#each histories as utterance}
	<div class="chat chat-start w-full">
		<div class="chat-image avatar">
			<div class="w-10 rounded-full">
				<img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
		  	</div>
		</div>
		<div class="chat-bubble w-30">{utterance.content}</div>
	</div>
	{/each}

	{#if !gameStarted}
	<input type="text" placeholder="Game Config" bind:value={gameSetting} 
		class="input input-bordered w-full max-w-xs" />
	<input type="text" placeholder="Player Num" bind:value={playerNum} 
		class="input input-bordered w-full max-w-xs" />
	<button on:click={start}> start </button>
	{/if}
	{#if !loading}
	<button on:click={next}> next </button>
	{/if}
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
