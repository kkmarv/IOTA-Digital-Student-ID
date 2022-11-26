import App from './App.svelte';

/**
 * Install service worker
 */
try {
    if (['127.0.0.1', 'localhost'].indexOf(window.location.hostname) < 0 && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js');
        });
    }
} catch (err) {
    /* eslint-disable no-console */
    console.log(err);
    /* eslint-enable no-console */
}

/**
 * Reset router location
 */

window.location.hash = '';

/**
 * Init main component
 */

const target = document.body;
target.innerHTML = '';

const index = new App({
    target: document.body,
    props: {}
});

export default index;
