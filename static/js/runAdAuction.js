
const sspUrl = 'https://localhost:8080';
const dspUrl = 'https://localhost:8080';
const auctionConfig = {
  seller: `${sspUrl}`,
  decisionLogicUrl: `${sspUrl}/static/js/decision-logic.js`,
  interestGroupBuyers: [dspUrl],
  resolveToConfig: true,
  auctionSignals: { isControversial: true },
  sellerSignals: { key: 'value' },
  sellerTimeout: 100,
  perBuyerSignals: {
    [dspUrl]: { windowInnerHeight: window.innerHeight },
  },
  perBuyerTimeouts: {
    '*': 50,
  },
};


document.addEventListener("DOMContentLoaded", function () {
  navigator.runAdAuction(auctionConfig)
    .then((auctionResult) => {
      // Display the ad
      const iframeEl = document.getElementById('fledge-ad');
      iframeEl.config = auctionResult
      console.log(auctionResult)

    }).catch((err) => {
      console.log('Failed to run ad auction', err);
    });

});


