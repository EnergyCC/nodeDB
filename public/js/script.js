if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('https://ionut.eccsv.com/service-worker.js')
    .then(() => {
      console.log('SW registered');
    })
    .catch(console.error);
}

function genRap(quality = 3) {
  let doc = new jsPDF('p', 'mm', 'a4');
  let canvas = document.querySelector('#canvas');
  let options = {
    pagesplit: true
  };
  console.log(canvas);
  doc.addHTML(canvas, 0, 0, () => {
    doc.save('test.pdf');
  });
}
