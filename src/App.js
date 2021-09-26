  
// Repository:  medals-b-react
// Author:      Jeff Grissom
// Version:     3.xx
import React, { useState, useEffect, useRef } from 'react';
import Country from './components/Country';
import './App.css';
import axios from 'axios';
import NewCountry from './components/NewCountry';
const App = () => {
  const [ countries, setCountries ] = useState([]);
  const apiEndpoint = "https://medalsapiandre.azurewebsites.net/api/country";
  const medals = useRef([
    //Hi jeff, i got this working in the react, but is it still possible to use a service to set the arrays?
    { id: 1, name: 'gold' },
    { id: 2, name: 'silver' },
    { id: 3, name: 'bronze' },
  ]);

    // this is the functional equivalent to componentDidMount
  useEffect(() => {
    // initial data loaded here
    async function fetchCountries() {
      const { data : fetchedCountries } = await axios.get(apiEndpoint);
      setCountries(fetchedCountries);
    }
    fetchCountries();
  }, []);

  const handleAdd = async (name) => {
    const { data: post } = await axios.post(apiEndpoint, { name: name});
    setCountries(countries.concat(post));
  }
  // const handleDelete = (countryId) => {
  //   setCountries([...countries].filter(c => c.id !== countryId));
  // }
  const handleDelete = async (Id) => {
    await axios.delete(`${apiEndpoint}/${Id}`);
    setCountries(countries.filter(c => c.id !== Id));}
    
    const handleIncrement = (countryId, medalName) => handleUpdate(countryId, medalName, 1);
    const handleDecrement = (countryId, medalName) =>  handleUpdate(countryId, medalName, -1)
    const handleUpdate = async (countryId, medalName, factor) => {
      const originalCountries = countries;
    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [...countries ];
    mutableCountries[idx][medalName] += (1 * factor);
    setCountries(mutableCountries);
    const jsonPatch = [{ op: "replace", path: medalName, value: mutableCountries[idx][medalName] }];
    console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);
    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        console.log("The record does not exist - it may have already been deleted");
      } else { 
        alert('An error occurred while updating');
        setCountries(originalCountries);
      }
    }
  }
  const getAllMedalsTotal = () => {
    let sum = 0;
    medals.current.forEach(medal => { sum += countries.reduce((a, b) => a + b[medal.name], 0); });
    return sum;
  }
  return (
    <React.Fragment>
      <div className='appHeading'>
        Olympic Medals
        <span className='badge'>
          { getAllMedalsTotal() }
        </span>
      </div>
      <div className='countries'>
          { countries.map(country => 
            <Country 
              key={ country.id } 
              country={ country } 
              medals={ medals.current }
              onDelete={ handleDelete }
              onIncrement={ handleIncrement } 
              onDecrement={ handleDecrement } />
          )}
      </div>
      <NewCountry onAdd={ handleAdd } />
    </React.Fragment>
  );
}
 
export default App;