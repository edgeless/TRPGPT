<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';

	async function sendChatToPlayer(message) => {
		// 既定のオプションには * が付いています
		const response = await fetch('trgpt-player.vercel.com/chat', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify(message) 
		})
		return response.json(); 
	}

	async function sendChatToGM(message) => {
		// 既定のオプションには * が付いています
		const response = await fetch('trgpt-gm.vercel.com/chat', {
			method: 'POST',
			mode: 'cors', 
			cache: 'no-cache', 
			credentials: 'same-origin', 
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer', 
			body: JSON.stringify(message) 
		})
		return response.json(); 
	}

	async function start = () => {
		const gmMessage = sendChatToGM();
		const playerMessage = sendChatToPlayer();
		history.append(gmMessage);
		history.append(playerMessage);
	}

	$: histories = []

</script>

<svelte:head>
	<title>TRPGT</title>
	<meta name="description" content="TRPGT" />
</svelte:head>

<section>
	<div>
		{#each histories as utterance}
			<p> utterance </p>
		{/each}
	</div>

	<button onClick={start}> start </button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
