import React, { useState, useEffect } from 'react';

import { getData } from './composables/getData.js'
// import './index.scss'
import ContributionGraph from './components/ContributionGraph.jsx';

const App = () => {
  const [contributions, setContributions] = useState([]);
  const endDate = new Date('2023-11-1');




  useEffect(() => {
    getData().then(data => {
      const days = Object.keys(data);
      const activities = Object.values(data);
      const length = days.length;
      const newContributions = [];

      for (let i = 0; i < length; i++) {
        newContributions.push({
          date: days[i],
          count: activities[i],
        });
      }

      setContributions(newContributions);
   


    });
  }, []);
  
  return (
    <>
      <ContributionGraph
        values={contributions}
        endDate={endDate}
      />
    </>
  );
};

export default App;
