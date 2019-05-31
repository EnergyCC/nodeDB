if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('https://ionut.eccsv.com/service-worker.js')
    .then(() => {
      console.log('SW registered');
    })
    .catch(console.error);
}
