    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('http://localhost:3003/service-worker.js')
            .then(() => {
                console.log('SW registered');
            })
            .catch(console.error);
    }