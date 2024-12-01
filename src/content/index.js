import React, { useEffect, useState } from 'react';

const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const oneWeekAgo = new Date().getTime() - millisecondsPerWeek;

const BrowseHistoryList = ({ divName }) => {

  const [urlArray, setUrlArray] = useState([]);
  const urlToCount = {};

  useEffect(() => {
    let numRequestsOutstanding = 0;
    const processVisits = (url, visitItems) => {
      for (let i = 0, ie = visitItems.length; i < ie; ++i) {
        if (!urlToCount[url]) {
          urlToCount[url] = 0;
        }
        urlToCount[url]++;
      }

      if (!--numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    };

    const onAllVisitsProcessed = () => {
      const urls = Object.keys(urlToCount);
      urls.sort((a, b) => urlToCount[b] - urlToCount[a]);
      setUrlArray(urls.slice(0, 10));

    };

    chrome.history.search(
      {
        text: '',
        startTime: oneWeekAgo,
      },
      (historyItems) => {
        for (let i = 0; i < historyItems.length; ++i) {
          const url = historyItems[i].url;
          chrome.history.getVisits({ url }, (visitItems) => {
            processVisits(url, visitItems);
          });
          numRequestsOutstanding++;
        }
        if (!numRequestsOutstanding) {
          onAllVisitsProcessed();
        }
      }
    );
  }, []);

  return (
    <div id={divName}>
      <ul>
        {urlArray.map((url, index) => (
          <li key={index}>{url}</li>
        ))}
      </ul>
    </div>

  );
};




export default BrowseHistoryList;
