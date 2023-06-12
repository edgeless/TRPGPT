<script>
	import Header from './Header.svelte';
	import './styles.css';

	import { onMount } from 'svelte';

	onMount(() => {
		import('eruda').then(({ default: eruda }) => {
			eruda.init();
		});
	});
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		height: 100vh;
	}

	main {
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		height: calc(100vh - 80px);
	}
</style>
