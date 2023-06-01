<script>

	let histories = ["test", "hoge"]
	let playerNum = 3;
	let loading = false;

	/**
	 * @param {string} message
	 */
	async function sendChatToPlayer(message){
		loading = true;
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
			body: JSON.stringify(message) 
		}).then((res) => res.text())// FIXME to json
		.then((data) => {
			loading = false;
			histories.push(data);
			histories = histories})
		.catch((e) => {
			console.log(e);
		})
	}

	/**
	 * @param {string} message
	 */
	async function sendChatToGM(message){
		loading = true;
		fetch('https://trpgpt-gm.vercel.app/api/chat', {
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
			histories.push(data);
			histories = histories})
		.catch((e) => {
			console.log(e);
		})
	}

	async function startSession(){
		loading = true;
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
			body: JSON.stringify({}) 
		}).then((res) => res.json()) // FIXME to json
		.then((data) => {

			loading = false;
			histories.push(data);
			histories = histories})
		.catch((e) => {
			console.log(e);
		})
	}


	async function start() {
		histories.push("-----");
		await startSession();
	}

	async function next() {
		histories.push("-----");
		await sendChatToGM("");
		await sendChatToPlayer("");
	}

</script>

<section>
	<div>
		{#each histories as utterance}
			<p> {utterance} </p>
		{/each}
	</div>

	<button on:click={start}> start </button>
	<button on:click={next}> next </button>
</section>

{#if loading}
  <div>Loading...</div>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

</style>
